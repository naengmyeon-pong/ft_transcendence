import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
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
import {GlobalVariableModule} from '@/global-variable/global-variable.module';
import {Type} from '@/record/type/type.entity';
import {Mode} from '@/record/mode/mode.entity';
import {SocketArray} from '@/global-variable/global.socket';
import {ETypeMode} from './types/type-mode.enum';

const waitUserList: GameUser[][] = [[], [], [], []];

export const gameRooms: Map<string, RoomInfo> = new Map();

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayDisconnect {
  private logger = new Logger('GameGateway');
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

  async afterInit() {
    this.logger.log('게임 서버 초기화');

    const gameTypes = ['normal', 'rank'];
    const gameModes = ['easy', 'hard'];

    await this.gameService.createData(gameTypes, 'type');
    await this.gameService.createData(gameModes, 'mode');
    this.gameService.setDataID();
    this.gameService.initWaitUserList(waitUserList);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userID = this.getUserID(socket);
    const roomName: string | null = this.gameService.isForfeit(userID);
    if (roomName) {
      const roomInfo = gameRooms.get(roomName);
      this.sendGameInfo(roomInfo);
      clearInterval(roomInfo.interval);
      gameRooms.delete(roomName);
    }
    this.logger.log('게임 소켓 연결 해제');
  }

  createGameRoom(userId: string, gameUsers: GameUser[]): string {
    const gameInfo = this.gameService.initGameInfo();

    gameRooms.set(userId, {
      room_name: userId,
      users: gameUsers,
      game_info: gameInfo,
      type_mode: gameUsers[0].type_mode,
      interval: null,
    });
    return userId;
  }

  @SubscribeMessage('exit_game') // 유저가 페이지를 이탈한 경우 (임시 이벤트)
  handleExitGame(@ConnectedSocket() socket: Socket) {
    const userID = this.getUserID(socket);
    const roomName: string | null = this.gameService.isForfeit(userID);
    if (roomName) {
      const roomInfo = gameRooms.get(roomName);
      this.sendGameInfo(roomInfo);
      clearInterval(roomInfo.interval);
      gameRooms.delete(roomName);
    }
  }

  @SubscribeMessage('cancel_waiting')
  handleCancelWaiting(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinGameInfo: JoinGameInfo
  ) {
    const typeMode = findTypeMode(joinGameInfo);
    const waitUsers: GameUser[] = waitUserList[typeMode];
    const user = this.getUserID(socket);
    let isFound = false;
    let index = -1;
    waitUsers.forEach((value, key) => {
      if (value.user_id === user) {
        isFound = true;
        index = key;
        return;
      }
    });
    if (isFound) {
      waitUsers.splice(index, 1);
    } else {
      console.log('Socket not in waiting list');
    }
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinGameInfo: JoinGameInfo
  ) {
    const user_id = this.getUserID(socket);
    const keys: KeyData = {up: false, down: false};
    const waitingUser: GameUser = {
      user_id,
      socket_id: socket.id,
      keys,
      type_mode: -1,
    };
    if (this.isGameMatched(joinGameInfo, waitingUser) === false) {
      return;
    } else {
      this.createRoom(waitingUser);
    }
  }

  createRoom = async (userSocket: GameUser) => {
    const gameUsers: GameUser[] = [];
    const firstUser = waitUserList[userSocket.type_mode].shift();
    const secondUser = userSocket;
    gameUsers.push(firstUser);
    gameUsers.push(secondUser);

    const roomName = this.createGameRoom(firstUser.user_id, gameUsers);
    this.joinRoom(firstUser.user_id, secondUser.user_id, roomName);

    const [left_user, right_user] = await this.findUserName(
      firstUser.user_id,
      secondUser.user_id
    );
    const firstSocketID = this.socketArray.getUserSocket(
      firstUser.user_id
    ).socket_id;
    this.nsp
      .to(firstSocketID)
      .emit('notice', {notice: `${right_user}이 입장했습니다.`});

    const roomInfo: RoomInfo = gameRooms.get(roomName);
    const gameInfo: GameInfo = roomInfo.game_info;
    const roomUserInfo: RoomUserInfo = {
      room_name: roomName,
      left_user,
      right_user,
    };
    if (
      roomInfo.type_mode === ETypeMode.NORMAL_HARD ||
      roomInfo.type_mode === ETypeMode.RANK_HARD
    ) {
      gameInfo.ball.speed *= 1.5;
    }

    this.nsp.to(roomName).emit('room_name', roomUserInfo);
    this.nsp.to(roomName).emit('game_info', {game_info: gameInfo});
  };

  joinRoom = (firstID: string, secondID: string, roomName: string) => {
    const firstSocketID = this.socketArray.getUserSocket(firstID).socket_id;
    const firstSocket = this.nsp.sockets.get(firstSocketID);
    firstSocket.join(roomName);
    const secondSocketID = this.socketArray.getUserSocket(secondID).socket_id;
    const secondSocket = this.nsp.sockets.get(secondSocketID);
    secondSocket.join(roomName);
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
    waitingUser: GameUser
  ): boolean => {
    waitingUser.type_mode = findTypeMode(joinGameInfo);
    const gameTypeMode = waitingUser.type_mode;
    if (gameTypeMode === -1) {
      throw new BadRequestException();
    }
    if (waitUserList[gameTypeMode].length === 0) {
      console.log('wait');
      waitUserList[gameTypeMode].push(waitingUser);
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

    if (this.gameService.isLeftUser(roomInfo, socket.id) === true) {
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

  // @SubscribeMessage('invite_game')
  // handleInviteGame(
  //   @ConnectedSocket() inviterSocket: Socket,
  //   @MessageBody() inviteGameInfo: InviteGameInfo
  // ) {
  //   console.log(inviteGameInfo);
  //   console.log('login users: ', this.socketArray);
  //   const targetInfo = this.socketArray.getUserSocket(
  //     inviteGameInfo.invitee_id
  //   );
  //   if (targetInfo === undefined) {
  //     return '접속중인 유저가 아닙니다.';
  //   } else if (targetInfo.is_gaming === true) {
  //     return '게임중인 유저입니다.';
  //   }
  //   // 소켓에서 찾고 게임만들고 전달하는 과정 접속중이 아니면 false리턴

  //   // if (
  //   //   inviterSocket.id !==
  //   //   this.socketArray.getUserSocket(inviteGameInfo.inviter_id)
  //   // ) {
  //   //   // 유저의 ID와 소켓이 매칭되지 않는 경우
  //   //   throw new BadRequestException();
  //   // }
  //   // const inviteeSocket = this.socketArray.getUserSocket(
  //   //   inviteGameInfo.invitee_id
  //   // );
  //   // if (!inviteeSocket) {
  //   // 초대받은 유저가 로그인 상태가 아닌 경우
  //   // inviterSocket.emit('invite_error', '유저가 로그인 상태가 아님');
  //   // return;
  //   // }
  //   // console.log('invitee : ', inviteeSocket);
  //   // inviterSocket.join(inviteGameInfo.inviter_id);
  //   // inviterSocket.to(inviteeSocket).emit('invite_game', inviteGameInfo);
  //   // inviterSocket.emit('test', 'hello');
  // }
}

const findTypeMode = (joinGameInfo: JoinGameInfo): number => {
  const mode = joinGameInfo.mode;
  const type = joinGameInfo.type;
  let gameTypeMode = -1;

  if (type === 'normal') {
    if (mode === 'easy') {
      gameTypeMode = ETypeMode.NORMAL_EASY;
    } else if (mode === 'hard') {
      gameTypeMode = ETypeMode.NORMAL_HARD;
    }
  } else if (type === 'rank') {
    if (mode === 'easy') {
      gameTypeMode = ETypeMode.RANK_EASY;
    } else if (mode === 'hard') {
      gameTypeMode = ETypeMode.RANK_HARD;
    }
  }
  return gameTypeMode;
};
