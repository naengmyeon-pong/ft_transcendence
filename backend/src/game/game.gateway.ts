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

const inviteWaitList: InviteGameInfo[] = [];

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
    const user_id = socket.handshake.query.user_id as string;
    console.log('user_id: ', user_id);
    console.log('room_name: ', room_name);
    console.log('socket_id: ', socket.id);

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

  /*
    알람을 데이터베이스에 저장하지 않아서 생기는 문제
    1. 이미 초대받은 사용자가 초대를 보내려는 경우
    2. 닉네임이 변경되는경우 갱신이 안됨
    3. 
  */

  // 전역변수로 두 아이디, 모드 저장
  @SubscribeMessage('invite_game')
  async handleInviteGame(
    @ConnectedSocket() inviterSocket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    // console.log(inviteGameInfo);
    const target = this.socketArray.getUserSocket(inviteGameInfo.invitee_id);
    if (target === undefined) {
      return false;
    }
    // console.log(target);
    // 유저 아이디를 조회해서 타겟에 전송
    try {
      const B = await this.userRepository.findOneBy({
        user_id: inviteGameInfo.invitee_id,
      });
      // 임시로 기존에 있으면 패스
      inviteGameInfo.inviter_nickname = B.user_nickname;
      const tmp = (item: InviteGameInfo) =>
        item.invitee_id === inviteGameInfo.invitee_id;
      if (!inviteWaitList.some(tmp)) {
        inviteWaitList.push(inviteGameInfo);
      }
      inviterSocket.to(target.socket_id).emit('invite_game', inviteGameInfo);
    } catch (error) {
      console.log('handleInviteGame Error: ', error);
    }

    //
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

  @SubscribeMessage('invite_response')
  handleInviteGameResponse(
    @ConnectedSocket() inviterSocket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo | string
  ) {
    // 본인의 소켓이 아닌 다른 소켓으로 보내야함
    const user_id = inviterSocket.handshake.query.user_id as string;
    // inviteGameInfo 이 B의 닉네임일경우 A의 소켓을 찾을 수가 없음

    // const target_id =
    //   user_id === inviteGameInfo.inviter_id
    //     ? inviteGameInfo.inviter_id
    //     : (typeof inviteGameInfo.invitee_id === 'object' ? ;
    // // inviterSocket.emit('invite_response', inviteGameInfo);
    // const target_socket_id = this.socketArray.getUserSocket(target_id);
    // inviterSocket
    //   .to(`${target_socket_id}`)
    //   .emit('invite_response', inviteGameInfo);
    return;
  }

  // 본인 아이디와 룸네임을 보내서, 서버에게 대기중이라는 상태를 보냅니다
  @SubscribeMessage('enter_game')
  handleInviteGameWait(
    @ConnectedSocket() inviterSocket: Socket,
    @MessageBody() {user_id, room_name}
  ) {
    console.log(user_id, room_name);
    return null;
  }
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
