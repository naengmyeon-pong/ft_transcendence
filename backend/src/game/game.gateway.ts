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
    if (this.isUserGaming(userID)) {
      const roomName: string | null = this.gameService.isForfeit(userID);
      if (roomName) {
        const roomInfo = gameRooms.get(roomName);
        this.sendGameInfo(roomInfo);
        clearInterval(roomInfo.interval);
        gameRooms.delete(roomName);
      }
    }
    try {
      this.socketArray.removeSocketArray(userID);
      this.logger.log(`${socket.id} 게임 소켓 연결 해제`);
    } catch (e) {
      this.logger.log(e.message);
    }
  }

  isUserGaming(userID: string): boolean {
    if (this.socketArray.getUserSocket(userID).is_gaming === true) {
      return true;
    }
    return false;
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

  @SubscribeMessage('exit_game') // 유저가 게임중에 페이지를 이탈한 경우 (임시 이벤트)
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
    this.joinRoom(firstUser.user_id, secondUser.user_id, roomName, false);

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
    this.socketArray.getUserSocket(left_user).is_gaming = true;
    this.socketArray.getUserSocket(right_user).is_gaming = true;
    this.nsp.to(roomName).emit('room_name', roomUserInfo);
    this.nsp.to(roomName).emit('game_info', {game_info: gameInfo});
  };

  createInviteGameRoom = async (inviteGameInfo: InviteGameInfo) => {
    const gameUsers: GameUser[] = [];
    const leftKeys: KeyData = {up: false, down: false};
    const rightKeys: KeyData = {up: false, down: false};
    const inviterSocketID = this.socketArray.getUserSocket(
      inviteGameInfo.inviter_id
    ).socket_id;
    const type_mode = findInviteGameMode(inviteGameInfo);
    const inviter: GameUser = {
      user_id: inviteGameInfo.inviter_id,
      socket_id: inviterSocketID,
      keys: leftKeys,
      type_mode,
    };
    const inviteeSocketID = this.socketArray.getUserSocket(
      inviteGameInfo.invitee_id
    ).socket_id;

    const invitee: GameUser = {
      user_id: inviteGameInfo.invitee_id,
      socket_id: inviteeSocketID,
      keys: rightKeys,
      type_mode,
    };
    gameUsers.push(inviter);
    gameUsers.push(invitee);

    const roomName = this.createGameRoom(inviter.user_id, gameUsers);
    this.joinRoom(inviter.socket_id, invitee.socket_id, roomName, true);

    const roomInfo: RoomInfo = gameRooms.get(roomName);
    const gameInfo: GameInfo = roomInfo.game_info;
    if (
      roomInfo.type_mode === ETypeMode.NORMAL_HARD ||
      roomInfo.type_mode === ETypeMode.RANK_HARD
    ) {
      gameInfo.ball.speed *= 1.5;
    }
  };

  joinRoom = (
    firstID: string,
    secondID: string,
    roomName: string,
    isSocketProvided: boolean
  ) => {
    let firstSocketID: string, secondSocketID: string;
    if (isSocketProvided === true) {
      firstSocketID = firstID;
      secondSocketID = secondID;
    } else {
      firstSocketID = this.socketArray.getUserSocket(firstID).socket_id;
      secondSocketID = this.socketArray.getUserSocket(secondID).socket_id;
    }
    const firstSocket = this.nsp.sockets.get(firstSocketID);
    firstSocket.join(roomName);
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
        this.socketArray.getUserSocket(roomInfo.users[0].user_id).is_gaming =
          false;
        this.socketArray.getUserSocket(roomInfo.users[1].user_id).is_gaming =
          false;
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
  ): Promise<string | null> {
    const userID = this.getUserID(inviterSocket);
    const userInfo = this.socketArray.getUserSocket(userID);
    if (userInfo.is_gaming === true) {
      return '게임중에는 초대할 수 없습니다.';
    }
    const target = this.socketArray.getUserSocket(inviteGameInfo.invitee_id);
    if (target === undefined) {
      return '유저가 로그인 상태가 아닙니다.';
    }
    // 유저 아이디를 조회해서 타겟에 전송
    const userA = await this.userRepository.findOneBy({
      user_id: inviteGameInfo.inviter_id,
    });
    if (!userA) {
      return '잘못된 요청입니다.'; // 유저의 정보가 존재하지 않는 경우
    }
    inviteGameInfo.inviter_nickname = userA.user_nickname;
    const userB = await this.userRepository.findOneBy({
      user_id: inviteGameInfo.invitee_id,
    });
    if (!userB) {
      return '잘못된 요청입니다.';
    }
    // 임시로 기존에 있으면 패스
    inviteGameInfo.invitee_nickname = userB.user_nickname;
    const tmp = (item: InviteGameInfo) =>
      item.invitee_id === inviteGameInfo.invitee_id &&
      item.inviter_id === inviteGameInfo.inviter_id;
    if (!inviteWaitList.some(tmp)) {
      inviteWaitList.push(inviteGameInfo);
    }
    inviterSocket.to(target.socket_id).emit('invite_game', inviteGameInfo);
  }

  @SubscribeMessage('invite_response')
  handleInviteGameResponse(
    @ConnectedSocket() inviteeSocket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    const targetSocketID = this.socketArray.getUserSocket(
      inviteGameInfo.inviter_id
    ).socket_id;

    if (inviteGameInfo.state === true) {
      this.createInviteGameRoom(inviteGameInfo);
    }
    inviteeSocket
      .to(`${targetSocketID}`)
      .emit('invite_response', inviteGameInfo);
  }

  @SubscribeMessage('cancel_game')
  async handleCancelGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      inviteGameInfo,
      is_inviter,
    }: {inviteGameInfo: InviteGameInfo; is_inviter: boolean}
  ) {
    const userID = this.getUserID(socket);
    if (is_inviter === true) {
      // 초대자가 게임을 취소한 경우
      const gameRoom = gameRooms.get(userID);
      const inviteeSocketID = gameRoom.users[1].socket_id;
      const user = await this.userRepository.findOneBy({user_id: userID});
      socket.to(inviteeSocketID).emit('cancel_game', user.user_nickname);
      gameRooms.delete(userID);
    } else if (inviteGameInfo !== undefined) {
      // 피초대자가 게임방에서 나간 경우
      if (userID !== inviteGameInfo.invitee_id) {
        return false;
      }
      const gameRoom = gameRooms.get(inviteGameInfo.inviter_id);
      const inviterSocketID = gameRoom.users[0].socket_id;
      socket.to(inviterSocketID).emit('cancel_game_alarm', inviteGameInfo);
    }
  }

  // 본인 아이디와 룸네임을 보내서, 서버에게 대기중이라는 상태를 보냅니다
  @SubscribeMessage('enter_game')
  handleEnterGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    const roomInfo: RoomInfo = gameRooms.get(inviteGameInfo.inviter_id);
    const user = this.getUserID(socket);
    socket.emit('game_info', {game_info: roomInfo.game_info});
    if (user === inviteGameInfo.inviter_id) {
      socket.emit('enter_game');
      this.socketArray.getUserSocket(inviteGameInfo.inviter_id).is_gaming =
        true;
      this.socketArray.getUserSocket(inviteGameInfo.invitee_id).is_gaming =
        true;
      const idx = inviteWaitList.indexOf(inviteGameInfo);
      inviteWaitList.splice(idx, 1);
      this.nsp.to(roomInfo.room_name).emit('start_game');
    }
  }
}

const findTypeMode = (joinGameInfo: JoinGameInfo): ETypeMode => {
  const mode = joinGameInfo.mode;
  const type = joinGameInfo.type;
  let gameTypeMode: ETypeMode;

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

const findInviteGameMode = (inviteGameInfo: InviteGameInfo): ETypeMode => {
  const mode: string = inviteGameInfo.mode;
  if (mode === 'easy') {
    return ETypeMode.NORMAL_EASY;
  } else if (mode === 'hard') {
    return ETypeMode.NORMAL_HARD;
  } else {
    console.log('Mode not found');
  }
};
