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
import {Payload} from '@/user/payload';
import {Friend} from '@/global-variable/global.friend';
import {AuthGuard} from '@nestjs/passport';

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
    private socketArray: SocketArray,
    private friend: Friend
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

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    let inviteGameInfo: InviteGameInfo | null;
    const {userID} = this.getUserID(socket);
    if (this.isUserGaming(userID)) {
      // 유저가 게임 중인 경우
      const roomName: string | null = this.gameService.isForfeit(userID);
      if (roomName) {
        const roomInfo = gameRooms.get(roomName);
        this.sendGameInfo(roomInfo);
        clearInterval(roomInfo.interval);
        gameRooms.delete(roomName);
        let targetID: string;
        if (roomInfo.users[0].user_id === userID) {
          targetID = roomInfo.users[1].user_id;
        } else {
          targetID = roomInfo.users[0].user_id;
        }
        this.updateState(false, targetID);
      }
    } else if ((inviteGameInfo = this.isUserInvited(userID))) {
      // 유저가 게임 초대중인 경우
      let targetNickname: string;
      if (userID === inviteGameInfo.inviter_id) {
        // 초대자가 끊긴 경우
        const targetSocket = this.socketArray.getUserSocket(
          inviteGameInfo.invitee_id
        ).socket;
        targetNickname = inviteGameInfo.inviter_nickname;
        targetSocket.leave(inviteGameInfo.invitee_id);
        targetSocket.emit('inviter_cancel_game_refresh', targetNickname);
      } else {
        // 피초대자가 끊긴 경우
        const targetSocket = this.socketArray.getUserSocket(
          inviteGameInfo.inviter_id
        ).socket;
        targetNickname = inviteGameInfo.invitee_nickname;
        targetSocket.leave(inviteGameInfo.inviter_id);
        targetSocket.emit('invitee_cancel_game_refresh', targetNickname);
      }
      let idx = -1;
      inviteWaitList.forEach((value, key) => {
        if (
          (value.inviter_id === userID &&
            value.invitee_id === inviteGameInfo.invitee_id) ||
          (value.invitee_id === userID &&
            value.inviter_id === inviteGameInfo.invitee_id)
        ) {
          idx = key;
          return;
        }
      });
      inviteWaitList.splice(idx, 1);
    }
    this.socketArray.removeSocketArray(userID);
    this.logger.log(`${socket.id} 웹소켓 연결 해제`);
  }

  isUserInvited = (userID: string): InviteGameInfo | null => {
    let ret: InviteGameInfo | null = null;
    inviteWaitList.forEach(value => {
      if (userID === value.inviter_id || userID === value.invitee_id) {
        ret = value;
      }
    });
    return ret;
  };

  isUserGaming(userID: string): boolean {
    const userInfo = this.socketArray.getUserSocket(userID);
    if (userInfo && userInfo.is_gaming === true) {
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

  @SubscribeMessage('exit_game') // 유저가 게임 중에 페이지를 이탈한 경우
  handleExitGame(@ConnectedSocket() socket: Socket) {
    // TODO: 토큰이 만료됐을 때,
    const {userID} = this.getUserID(socket);
    const roomName: string | null = this.gameService.isForfeit(userID);
    if (roomName) {
      const roomInfo = gameRooms.get(roomName);
      this.sendGameInfo(roomInfo);
      clearInterval(roomInfo.interval);
      let targetID: string;
      if (roomInfo.users[0].user_id === userID) {
        targetID = roomInfo.users[1].user_id;
      } else {
        targetID = roomInfo.users[0].user_id;
      }
      this.updateState(false, userID, targetID);
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
    const {userID} = this.getUserID(socket);
    let isFound = false;
    let index = -1;
    waitUsers.forEach((value, key) => {
      if (value.user_id === userID) {
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
    const {userID, isExpired} = this.getUserID(socket);
    if (isExpired) {
      return;
    }
    const keys: KeyData = {up: false, down: false};
    const waitingUser: GameUser = {
      user_id: userID,
      socket_id: socket.id,
      keys,
      type_mode: ETypeMode.NONE,
    };
    if (this.isGameMatched(joinGameInfo, waitingUser) === false) {
      return;
    } else {
      const {firstUserId, secondUserId} = await this.createRoom(waitingUser);
      this.updateState(true, firstUserId, secondUserId);
      this.removeInviteWaitlistJoinGame(firstUserId);
      this.removeInviteWaitlistJoinGame(secondUserId);
    }
  }

  createRoom = async (
    userSocket: GameUser
  ): Promise<{firstUserId: string; secondUserId: string}> => {
    const gameUsers: GameUser[] = [];
    const firstUser = waitUserList[userSocket.type_mode].shift();
    const secondUser = userSocket;
    const firstUserId = firstUser.user_id;
    const secondUserId = secondUser.user_id;
    gameUsers.push(firstUser);
    gameUsers.push(secondUser);

    const roomName = this.createGameRoom(firstUser.user_id, gameUsers);
    this.joinRoom(firstUser.user_id, secondUser.user_id, roomName, false);

    const [left_user, right_user] = await this.findUserNickname(
      firstUser.user_id,
      secondUser.user_id
    );
    const firstInfo = this.socketArray.getUserSocket(firstUser.user_id);
    firstInfo.socket.emit('notice', {notice: `${right_user}이 입장했습니다.`});

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

    return {firstUserId, secondUserId};
  };

  createInviteGameRoom = (inviteGameInfo: InviteGameInfo) => {
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

  findUserNickname = async (
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
    if (gameTypeMode === ETypeMode.NONE) {
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
        this.updateState(
          false,
          roomInfo.users[0].user_id,
          roomInfo.users[1].user_id
        );
        const firstSocket = this.socketArray.getUserSocket(
          roomInfo.users[0].user_id
        ).socket;
        const secondSocket = this.socketArray.getUserSocket(
          roomInfo.users[0].user_id
        ).socket;
        firstSocket.leave(roomInfo.room_name);
        secondSocket.leave(roomInfo.room_name);
        gameRooms.delete(roomInfo.room_name);
      }
    }, 1000 / 120);
  }

  sendGameInfo = (roomInfo: RoomInfo) => {
    this.nsp
      .to(roomInfo.room_name)
      .emit('game_info', {game_info: roomInfo.game_info});
  };

  getUserID = (socket: Socket): {userID: string; isExpired: boolean} => {
    const jwt: string = socket.handshake.auth.token;
    try {
      const decodedToken = this.jwtService.verify(jwt, {
        secret: process.env.SIGNIN_JWT_SECRET_KEY,
      });
      return {userID: decodedToken.user_id, isExpired: false};
    } catch (e) {
      this.logger.log('token expire');
      socket.emit('token-expire');
      const decodedToken: any = this.jwtService.decode(jwt);
      if (decodedToken !== null) {
        return {userID: decodedToken.user_id, isExpired: true};
      }
    }
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
    const {userID, isExpired} = this.getUserID(inviterSocket);
    if (isExpired) {
      return;
    }
    const userInfo = this.socketArray.getUserSocket(userID);
    if (userInfo.is_gaming === true) {
      return '게임 중에는 초대할 수 없습니다.';
    }
    const target = this.socketArray.getUserSocket(inviteGameInfo.invitee_id);
    if (target === undefined) {
      return '유저가 로그인 상태가 아닙니다.';
    } else if (target.is_gaming === true) {
      return '유저가 게임 중입니다.';
    }
    // 유저 아이디를 조회해서 타겟에 전송
    const inviter = await this.userRepository.findOneBy({
      user_id: inviteGameInfo.inviter_id,
    });
    if (!inviter) {
      return '잘못된 요청입니다.'; // 유저의 정보가 존재하지 않는 경우
    }
    inviteGameInfo.inviter_nickname = inviter.user_nickname;
    const invitee = await this.userRepository.findOneBy({
      user_id: inviteGameInfo.invitee_id,
    });
    if (!invitee) {
      return '잘못된 요청입니다.';
    }
    inviteGameInfo.invitee_nickname = invitee.user_nickname;
    // 초대자가 같은 유저에게 초대를 중복으로 보낸 경우
    const tmp = (item: InviteGameInfo) =>
      item.invitee_id === inviteGameInfo.invitee_id &&
      item.inviter_id === inviteGameInfo.inviter_id;
    if (!inviteWaitList.some(tmp)) {
      inviteWaitList.push(inviteGameInfo);
      inviterSocket.to(target.socket_id).emit('invite_game', inviteGameInfo);
    }
  }

  @SubscribeMessage('invite_response')
  handleInviteGameResponse(
    @ConnectedSocket() inviteeSocket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    const targetSocketID = this.socketArray.getUserSocket(
      inviteGameInfo.inviter_id
    ).socket_id;
    const {userID, isExpired} = this.getUserID(inviteeSocket);
    if (isExpired) {
      this.changeInviteGameState(inviteGameInfo, false);
      inviteeSocket
        .to(`${targetSocketID}`)
        .emit('invite_response', inviteGameInfo);
      return;
    }

    if (inviteGameInfo.state === true) {
      if (this.isInviteeIntWaitingPage(userID)) {
        return false;
      }
      if (this.isInviterAvailable(inviteGameInfo.inviter_id)) {
        return false;
      }
      this.changeInviteGameState(inviteGameInfo, true);
      this.createInviteGameRoom(inviteGameInfo);
    } else {
      this.removeInviteWaitlistInviteResponse(userID);
    }
    inviteeSocket
      .to(`${targetSocketID}`)
      .emit('invite_response', inviteGameInfo);
    return true;
  }

  // 상대방이 게임이 가능한지를 확인
  isInviterAvailable = (inviterID: string): boolean => {
    const targetInfo = this.socketArray.getUserSocket(inviterID);
    if (!targetInfo || targetInfo.is_gaming === true) {
      return true;
    }
    return false;
  };

  // 유저가 대기방에 있는지를 확인
  isInviteeIntWaitingPage = (userID: string): boolean => {
    let isWaitingPage = false;
    const userInfo = this.socketArray.getUserSocket(userID);
    if (userInfo.is_gaming === true) {
      return true;
    }
    inviteWaitList.forEach((value, key) => {
      console.log(value);
      if (value.invitee_id === userID) {
        if (value.state !== undefined && value.state === true) {
          isWaitingPage = true;
          return;
        }
      }
    });
    return isWaitingPage;
  };

  changeInviteGameState = (inviteGameInfo: InviteGameInfo, state: boolean) => {
    const inviterID = inviteGameInfo.inviter_id;
    const inviteeID = inviteGameInfo.invitee_id;
    inviteWaitList.forEach((value, key) => {
      if (value.inviter_id === inviterID && value.invitee_id === inviteeID) {
        value.state = state;
        return;
      }
    });
  };

  @SubscribeMessage('cancel_game')
  handleCancelGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {
      inviteGameInfo,
      is_inviter,
    }: {inviteGameInfo: InviteGameInfo; is_inviter: boolean}
  ) {
    const {userID} = this.getUserID(socket);
    if (is_inviter === true) {
      // 초대자가 최종 거절해서 게임을 취소한 경우
      gameRooms.delete(userID);
      this.removeInviteWaitlistCancelGame(
        true,
        userID,
        inviteGameInfo.invitee_id
      );
    } else if (inviteGameInfo !== undefined && is_inviter === false) {
      // 피초대자가 수락한 뒤에 게임방에서 나간 경우
      if (userID !== inviteGameInfo.invitee_id) {
        return false;
      }
      gameRooms.delete(inviteGameInfo.inviter_id);
      this.removeInviteWaitlistCancelGame(
        false,
        userID,
        inviteGameInfo.inviter_id
      );
    }
  }

  // 본인 아이디와 룸네임을 보내서, 서버에게 대기중이라는 상태를 보냅니다
  @SubscribeMessage('enter_game')
  handleEnterGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    const roomInfo: RoomInfo = gameRooms.get(inviteGameInfo.inviter_id);
    const {userID, isExpired} = this.getUserID(socket);
    if (isExpired === true) {
      this.removeInviteWaitlistEnterGameExpired(userID, inviteGameInfo); // jwt 만료된 경우
      return;
    }
    socket.emit('game_info', {game_info: roomInfo.game_info});
    if (userID === inviteGameInfo.invitee_id) {
      // 첫 번재로 들어온 유저 (피초대자)
      this.removeUserInWaitlist(userID); // 랜덤 게임 대기자 삭제
      this.checkPreviousInvitation(userID);
    } else if (userID === inviteGameInfo.inviter_id) {
      // 두 번째로 들어온 유저 (초대자)
      socket.emit('enter_game');
      this.updateState(
        true,
        inviteGameInfo.inviter_id,
        inviteGameInfo.invitee_id
      );
      this.removeUserInWaitlist(userID); // 랜덤 게임 대기자 삭제
      this.removeInviteWaitlistEnterGame(userID, inviteGameInfo.invitee_id);
      this.nsp.to(roomInfo.room_name).emit('start_game');
    }
  }

  checkPreviousInvitation = (userID: string) => {
    const idxArr: number[] = [];
    inviteWaitList.forEach((value, key) => {
      if (value.inviter_id === userID) {
        idxArr.push(key);
        const targetSocket = this.socketArray.getUserSocket(
          value.invitee_id
        ).socket;
        targetSocket.emit('inviter_cancel_game_refuse', value.inviter_nickname);
        targetSocket.leave(value.inviter_id);
      }
    });
    if (idxArr.length === 0) {
      return;
    }
    idxArr.forEach(value => {
      inviteWaitList.splice(value, 1);
    });
  };

  // 피초대자가 대기페이지를 뒤로가기하여 이탈한 경우
  @SubscribeMessage('invitee_cancel_game_back')
  handleInviteeCancelGameBack(
    @ConnectedSocket() inviteeSocket: Socket,
    @MessageBody() inviteGameInfo: InviteGameInfo
  ) {
    const {userID} = this.getUserID(inviteeSocket);
    let idx = -1;
    inviteWaitList.forEach((value, key) => {
      if (
        value.invitee_id === userID &&
        value.inviter_id === inviteGameInfo.inviter_id
      ) {
        idx = key;
        return;
      }
    });
    if (idx !== -1) {
      inviteWaitList.splice(idx, 1);
    }
    gameRooms.delete(inviteGameInfo.inviter_id);
    const inviterSocket = this.socketArray.getUserSocket(
      inviteGameInfo.inviter_id
    ).socket;
    inviterSocket.leave(inviteGameInfo.inviter_id);
    inviteeSocket.leave(inviteGameInfo.inviter_id);
    inviterSocket.emit(
      'invitee_cancel_game_back',
      inviteGameInfo.invitee_nickname
    );
    console.log('game canceled');
  }

  removeInviteWaitlistInviteResponse = (userID: string) => {
    let idx = -1;
    inviteWaitList.forEach((value, key) => {
      if (value.invitee_id === userID) {
        idx = key;
        return;
      }
    });
    if (idx !== -1) {
      inviteWaitList.splice(idx, 1);
    }
  };

  // 랜덤 매칭 시작 시, 기존에 주고받은 초대를 리스트에서 제거
  removeInviteWaitlistJoinGame = (userID: string) => {
    const canceled: number[] = [];
    inviteWaitList.forEach((value, key) => {
      if (value.inviter_id === userID) {
        // 자신이 초대한 경우
        canceled.push(key);
        const targetSocket = this.socketArray.getUserSocket(
          value.invitee_id
        ).socket;
        targetSocket.leave(value.inviter_id);
        targetSocket.emit('inviter_cancel_game_betray', value.inviter_nickname);
        const userSocket = this.socketArray.getUserSocket(userID).socket;
        userSocket.emit('inviter_cancel_game_refresh', value.inviter_nickname);
        if (value.state === true) {
          // room이 생성된 경우
          const roomInfo = gameRooms.get(value.inviter_id);
          if (roomInfo.users[1].user_id === value.invitee_id) {
            // 기존에 존재하던 room
            gameRooms.delete(value.inviter_id);
          }
        }
      } else if (value.invitee_id === userID) {
        // 자신이 초대받은 경우
        canceled.push(key);
        const targetSocket = this.socketArray.getUserSocket(
          value.inviter_id
        ).socket;
        targetSocket.leave(value.inviter_id);
        targetSocket.emit(
          'invitee_cancel_invite_betray',
          value.invitee_nickname
        );
        const userSocket = this.socketArray.getUserSocket(userID).socket;
        userSocket.emit('invitee_cancel_game_refresh', value.invitee_nickname);
      }
    });
    canceled.forEach(value => {
      inviteWaitList.splice(value, 1);
    });
  };

  // 유저가 게임을 취소한 경우
  removeInviteWaitlistCancelGame = (
    isInviter: boolean,
    userID: string,
    otherID?: string
  ) => {
    let idx = -1;
    // 리스트에서 해당 게임을 찾는다
    if (isInviter === true) {
      inviteWaitList.forEach((value, key) => {
        if (value.inviter_id === userID && value.invitee_id === otherID) {
          // 초대자가 최종거절한 경우
          idx = key;
          const userSocket = this.socketArray.getUserSocket(userID).socket;
          const targetSocket = this.socketArray.getUserSocket(otherID).socket;
          userSocket.leave(inviteWaitList[idx].inviter_id);
          targetSocket.leave(inviteWaitList[idx].inviter_id);
          targetSocket.emit(
            'inviter_cancel_game_refuse',
            inviteWaitList[idx].inviter_nickname
          );
          return;
        }
      });
    } else {
      inviteWaitList.forEach((value, key) => {
        if (value.invitee_id === userID && value.inviter_id === otherID) {
          // 피초대자가 게임대기창에서 나간 경우
          idx = key;
          const userSocket = this.socketArray.getUserSocket(userID).socket;
          const targetSocket = this.socketArray.getUserSocket(otherID).socket;
          userSocket.leave(inviteWaitList[idx].inviter_id);
          targetSocket.leave(inviteWaitList[idx].inviter_id);
          targetSocket.emit(
            'invitee_cancel_game_out',
            inviteWaitList[idx].invitee_nickname
          );
          return;
        }
      });
    }
    if (idx !== -1) {
      inviteWaitList.splice(idx, 1);
      return;
    }
  };

  // 유저가 초대에 수락하여 게임에 들어갈 때 토큰이 만료된 경우
  removeInviteWaitlistEnterGameExpired = (
    userID: string,
    inviteGameInfo: InviteGameInfo
  ) => {
    let idx = -1;
    const canceled: number[] = [];
    inviteWaitList.forEach((value, key) => {
      if (
        value.inviter_id === userID &&
        value.invitee_id === inviteGameInfo.invitee_id
      ) {
        // 초대자가 최종수락한 시점에 토큰이 만료된 경우
        idx = key;
        const targetSocket = this.socketArray.getUserSocket(
          inviteGameInfo.invitee_id
        ).socket;
        targetSocket.leave(value.inviter_id);
        targetSocket.emit('inviter_cancel_game_betray', value.inviter_nickname);
      } else if (
        value.invitee_id === userID &&
        value.inviter_id === inviteGameInfo.inviter_id
      ) {
        // 피초대자가 초대를 수락한 시점에 토큰이 만료된 경우
        idx = key;
        const targetSocket = this.socketArray.getUserSocket(
          inviteGameInfo.inviter_id
        ).socket;
        targetSocket.leave(value.inviter_id);
        targetSocket.emit('inviter_cancel_game_betray', value.invitee_nickname);
      } else if (value.inviter_id === userID || value.invitee_id === userID) {
        canceled.push(key);
        if (value.inviter_id === userID) {
          // 자신이 초대한 다른 게임 유저
          const targetSocket = this.socketArray.getUserSocket(
            value.invitee_id
          ).socket;
          targetSocket.emit(
            'inviter_cancel_game_refuse',
            value.inviter_nickname
          );
          targetSocket.leave(value.inviter_id);
        } else {
          // 자신이 초대받은 다른 게임 유저
          const targetSocket = this.socketArray.getUserSocket(
            value.inviter_id
          ).socket;
          targetSocket.emit(
            'inviter_cancel_game_refuse',
            value.invitee_nickname
          );
          targetSocket.leave(value.inviter_id);
        }

        const targetSocket = this.socketArray.getUserSocket(
          value.invitee_id
        ).socket;
        targetSocket.emit('inviter_cancel_game_refuse', value.inviter_nickname);
        targetSocket.leave(value.inviter_id);
      }
    });
  };

  // 게임을 시작할 때, 해당 게임을 대기 리스트에서 지우고 다른 유저와 주고받은 게임 초대를 지우는 함수
  removeInviteWaitlistEnterGame = (userID: string, inviteeID: string) => {
    let idx = -1;
    const canceled: number[] = [];
    inviteWaitList.forEach((value, key) => {
      if (value.inviter_id === userID) {
        if (value.invitee_id === inviteeID) {
          idx = key;
        } else {
          canceled.push(key);
          const targetSocket = this.socketArray.getUserSocket(
            value.invitee_id
          ).socket;
          targetSocket.emit(
            'inviter_cancel_game_refuse',
            value.inviter_nickname
          );
          targetSocket.leave(value.inviter_id);
        }
      }
    });
    if (idx !== -1) {
      inviteWaitList.splice(idx, 1);
    }
    canceled.forEach(value => {
      inviteWaitList.splice(value, 1);
    });
  };

  removeUserInWaitlist = (userID: string): boolean => {
    let user_idx = -1;
    for (let i = 0; i < ETypeMode.RANK_HARD; i++) {
      waitUserList[i].forEach((value, key) => {
        if (value.user_id === userID) {
          user_idx = key;
          return;
        }
      });
      if (user_idx !== -1) {
        waitUserList[i].splice(user_idx, 1);
        return true;
      }
      return false;
    }
  };

  updateState(isGaming: boolean, firstID: string, secondID?: string) {
    this.updateUserState(firstID, isGaming);
    this.updateFriendState(firstID, isGaming);
    if (secondID) {
      this.updateUserState(secondID, isGaming);
      this.updateFriendState(secondID, isGaming);
    }
  }

  updateUserState(userID: string, isGaming: boolean) {
    const userInfo = this.socketArray.getUserSocket(userID);
    userInfo.is_gaming = isGaming;
  }

  updateFriendState(userID: string, isGaming: boolean) {
    let state: string;
    if (isGaming === true) {
      state = '게임 중';
    } else {
      state = '온라인';
    }
    const friends: Set<string> = this.friend.getFriendUsers(userID);
    if (friends) {
      friends.forEach(e => {
        const friend = this.socketArray.getUserSocket(e);
        if (friend) {
          this.nsp
            .to(friend.socket_id)
            .emit('update-friend-state', {userId: userID, state});
        }
      });
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
