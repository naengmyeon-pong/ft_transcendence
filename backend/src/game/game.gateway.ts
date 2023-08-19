import {InternalServerErrorException, Logger, UseGuards} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Namespace, Socket, Server} from 'socket.io';
import {User} from 'src/user/user.entitiy';
import {
  GameInfo,
  RoomUserInfo,
  JoinGameInfo,
  InviteGameInfo,
} from '@/types/game';
import {GameUser} from './types/game-user.interface';
import {KeyData} from './types/key-data.interface';
import {RoomInfo} from './types/room-info.interface';
import {EUserIndex} from './types/user-index.enum';
import {UserRepository} from 'src/user/user.repository';
import {RecordRepository} from 'src/record/record.repository';
import {ModeRepository} from 'src/record/mode/mode.repository';
import {TypeRepository} from 'src/record/type/type.repository';
import {JwtService} from '@nestjs/jwt';
import {GameService} from './game.service';
import {SocketArray} from '@/globalVariable/global.socket';

const NORMAL_EASY = 0;
const NORMAL_HARD = 1;
const RANK_EASY = 2;
const RANK_HARD = 3;

const waitUserList: GameUser[][] = [[], [], [], []];

export const gameRooms: Map<string, RoomInfo> = new Map();

interface GameSocketInfo {
  socket: Socket;
  is_gaming: boolean;
}

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('Gateway');
  constructor(
    private gameService: GameService,
    private userRepository: UserRepository,
    private recordRepository: RecordRepository,
    private modeRepository: ModeRepository,
    private typeRepository: TypeRepository,
    private jwtService: JwtService,
    private socketArray: SocketArray
  ) {}

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.logger.log('게임 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결`);
    const userID = this.getUserID(socket);
    // const user_id = socket.handshake.query.user_id as string;
    this.socketArray.addGameSocketArray({
      user_id: userID,
      socket_id: socket.id,
    });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const roomName: string | null = this.gameService.isForfeit(socket);
    if (roomName) {
      const roomInfo = gameRooms.get(roomName);
      this.sendGameInfo(roomInfo);
      clearInterval(roomInfo.interval);
      gameRooms.delete(roomName);
    }
    this.logger.log(`${socket.id} 게임 소켓 연결 해제`);
  }

  createGameRoom(userId: string, gameUserSockets: GameUser[]): string {
    const gameInfo = this.gameService.initGameInfo();

    gameRooms.set(userId, {
      room_name: userId,
      users: gameUserSockets,
      game_info: gameInfo,
      type_mode: gameUserSockets[0].type_mode,
      interval: null,
    });
    return userId;
  }

  @SubscribeMessage('cancel_waiting')
  handleCancelWaiting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinGameInfo: JoinGameInfo
  ) {
    const typeMode = findTypeMode(joinGameInfo);
    const waitUsers: GameUser[] = waitUserList[typeMode];
    for (let i = 0; i <= RANK_HARD; i++) {
      if (waitUsers[i].socket.id === socket.id) {
        waitUsers.splice(i, 1);
        return;
      }
    }
    console.log('Socket not in waiting list');
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinGameInfo: JoinGameInfo
  ) {
    let user_id: string;
    socket.handshake.auth;
    try {
      const decodedToken = this.jwtService.verify(joinGameInfo.jwt, {
        secret: process.env.SIGNIN_JWT_SECRET_KEY,
      });
      user_id = decodedToken.user_id;
      const keys: KeyData = {up: false, down: false};
      const userSocket: GameUser = {
        user_id,
        socket,
        keys,
        type_mode: -1,
      };
      console.log(userSocket);
      if (this.isGameMatched(joinGameInfo, userSocket) === false) {
        return;
      } else {
        this.createRoom(userSocket);
      }
    } catch (err) {
      console.error('JWT verification error: ', err.message);
      // client에 이벤트 전송
    }
  }

  createRoom = async (userSocket: GameUser) => {
    const gameUserSockets: GameUser[] = [];
    const firstUser = waitUserList[userSocket.type_mode].shift();
    const secondUser = userSocket;
    gameUserSockets.push(firstUser);
    gameUserSockets.push(secondUser);

    const roomName = this.createGameRoom(firstUser.user_id, gameUserSockets);

    firstUser.socket.join(roomName);
    secondUser.socket.join(roomName);

    const [left_user, right_user] = await this.findUserName(
      firstUser.user_id,
      secondUser.user_id
    );
    secondUser.socket
      .to(roomName)
      .emit('notice', {notice: `${right_user}이 입장했습니다.`});

    const roomInfo: RoomInfo = gameRooms.get(roomName);
    const gameInfo: GameInfo = roomInfo.game_info;
    const roomUserInfo: RoomUserInfo = {
      room_name: roomName,
      left_user,
      right_user,
    };
    if (
      roomInfo.type_mode === NORMAL_HARD ||
      roomInfo.type_mode === RANK_HARD
    ) {
      gameInfo.ball.speed *= 1.5;
    }

    this.nsp.to(roomName).emit('room_name', roomUserInfo);
    this.nsp.to(roomName).emit('game_info', {game_info: gameInfo});
  };

  findUserName = async (
    leftUserID: string,
    rightUserID: string
  ): Promise<[string, string]> => {
    const left = await this.userRepository.findOneBy({user_id: leftUserID});
    if (left === null) {
      throw new InternalServerErrorException();
    }
    const leftUser = left.user_nickname;
    const right = await this.userRepository.findOneBy({user_id: rightUserID});
    if (left === null) {
      throw new InternalServerErrorException();
    }
    const rightUser = right.user_nickname;
    return [leftUser, rightUser];
  };

  isGameMatched = (
    joinGameInfo: JoinGameInfo,
    userSocket: GameUser
  ): boolean => {
    userSocket.type_mode = findTypeMode(joinGameInfo);
    const gameTypeMode = userSocket.type_mode;
    if (gameTypeMode === -1) {
      // type & mode not found
    }
    if (waitUserList[gameTypeMode].length === 0) {
      console.log('wait');
      waitUserList[gameTypeMode].push(userSocket);
      return false;
    } else {
      console.log('join');
      return true;
    }
  };

  @SubscribeMessage('update_key')
  handleKeyDown(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {room_name, up, down}: {room_name: string; up: boolean; down: boolean}
  ) {
    const roomInfo: RoomInfo = gameRooms.get(room_name);

    if (this.gameService.isLeftUser(roomInfo, socket) === true) {
      roomInfo.users[EUserIndex.LEFT].keys.up = up;
      roomInfo.users[EUserIndex.LEFT].keys.down = down;
    } else {
      roomInfo.users[EUserIndex.RIGHT].keys.up = up;
      roomInfo.users[EUserIndex.RIGHT].keys.down = down;
    }
  }

  @SubscribeMessage('update_frame')
  handleFrame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_name: string
  ) {
    const roomInfo: RoomInfo = gameRooms.get(room_name);
    const gameInfo: GameInfo = roomInfo.game_info;
    const leftUserKeyState: KeyData = roomInfo.users[EUserIndex.LEFT].keys;
    const rightUserKeyState: KeyData = roomInfo.users[EUserIndex.RIGHT].keys;

    if (roomInfo.interval !== null) {
      return;
    }
    gameInfo.timeStamp = Date.now();
    roomInfo.interval = setInterval(() => {
      const currentTime = Date.now();
      const gameOver: boolean = this.gameService.updateBallPosition(
        gameInfo,
        currentTime
      );
      gameInfo.timeStamp = currentTime;
      this.sendGameInfo(roomInfo);
      this.gameService.updatePaddlePosition(
        gameInfo.leftPaddle,
        leftUserKeyState.up,
        leftUserKeyState.down
      );
      this.gameService.updatePaddlePosition(
        gameInfo.rightPaddle,
        rightUserKeyState.up,
        rightUserKeyState.down
      );
      if (gameOver === true) {
        // 게임이 정상 종료된 경우
        clearInterval(roomInfo.interval);
        console.log('game over!');
        this.gameService.saveRecord(roomInfo, false, null);
        gameRooms.delete(roomInfo.room_name);
      }
    }, 1000 / 120);
  }

  sendGameInfo = (roomInfo: RoomInfo) => {
    this.nsp
      .to(roomInfo.room_name)
      .emit('game_info', {game_info: roomInfo.game_info});
  };

  getUserID = (socket: Socket): string => {
    const jwt: string = socket.handshake.auth.token;
    const decodedToken = this.jwtService.verify(jwt, {
      secret: process.env.SIGNIN_JWT_SECRET_KEY,
    });
    return decodedToken.user_id;
  };
  @SubscribeMessage('invite_game')
  handleInviteGame(
    @ConnectedSocket() inviterSocket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    console.log(inviteGameInfo);
    const target_socket_id = this.socketArray.getUserSocket(
      inviteGameInfo.invitee_id
    );
    if (target_socket_id === undefined) {
      return false;
    }
    // 소켓에서 찾고 게임만들고 전달하는 과정 접속중이 아니면 false리턴

    // if (
    //   inviterSocket.id !==
    //   this.socketArray.getUserSocket(inviteGameInfo.inviter_id)
    // ) {
    //   // 유저의 ID와 소켓이 매칭되지 않는 경우
    //   throw new BadRequestException();
    // }
    // const inviteeSocket = this.socketArray.getUserSocket(
    //   inviteGameInfo.invitee_id
    // );
    // if (!inviteeSocket) {
    // 초대받은 유저가 로그인 상태가 아닌 경우
    // inviterSocket.emit('invite_error', '유저가 로그인 상태가 아님');
    // return;
    // }
    // console.log('invitee : ', inviteeSocket);
    // inviterSocket.join(inviteGameInfo.inviter_id);
    // inviterSocket.to(inviteeSocket).emit('invite_game', inviteGameInfo);
    // inviterSocket.emit('test', 'hello');
  }
}

const findTypeMode = (joinGameInfo: JoinGameInfo): number => {
  const mode = joinGameInfo.mode;
  const type = joinGameInfo.type;
  let gameTypeMode = -1;

  if (type === 'normal') {
    if (mode === 'easy') {
      gameTypeMode = NORMAL_EASY;
    } else if (mode === 'hard') {
      gameTypeMode = NORMAL_HARD;
    }
  } else if (type === 'rank') {
    if (mode === 'easy') {
      gameTypeMode = RANK_EASY;
    } else if (mode === 'hard') {
      gameTypeMode = RANK_HARD;
    }
  }
  return gameTypeMode;
};
