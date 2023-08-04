import {Logger} from '@nestjs/common';
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
import {GameInfo, RoomUserInfo, JoinGameInfo} from '@/types/game';
import {GameUser} from './types/game_user.interface';
import {KeyData} from './types/key_data.interface';
import {RoomInfo} from './types/room_info.interface';
import {EUserIndex} from './types/user_index.enum';
import {UserRepository} from 'src/user/user.repository';
import {RecordRepository} from 'src/record/record.repository';
import {ModeRepository} from 'src/record/mode/mode.repository';
import {TypeRepository} from 'src/record/type/type.repository';
import {JwtService} from '@nestjs/jwt';
import {GameService} from './game.service';
import {number} from 'joi';

const NORMAL_EASY = 0;
const NORMAL_HARD = 1;
const RANK_EASY = 2;
const RANK_HARD = 3;

const waitUserList: GameUser[][] = [[], [], [], []];

export const gameRooms: Map<string, RoomInfo> = new Map();

@WebSocketGateway({
  namespace: 'game',
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
    private jwtService: JwtService
  ) {}

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.logger.log('게임 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결`);
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

  createRoom = (userSocket: GameUser) => {
    const gameUserSockets: GameUser[] = [];
    const firstUser = waitUserList[userSocket.type_mode].shift();
    const secondUser = userSocket;
    gameUserSockets.push(firstUser);
    gameUserSockets.push(secondUser);

    const roomName = this.createGameRoom(firstUser.user_id, gameUserSockets);

    firstUser.socket.join(roomName);
    secondUser.socket.join(roomName);
    secondUser.socket
      .to(roomName)
      .emit('notice', {notice: `${secondUser.user_id}이 입장했습니다.`});

    const roomInfo: RoomInfo = gameRooms.get(roomName);
    const gameInfo: GameInfo = roomInfo.game_info;
    const roomUserInfo: RoomUserInfo = {
      room_name: roomName,
      left_user: firstUser.user_id,
      right_user: secondUser.user_id,
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
      let currTime = Date.now();
      const gameOver: boolean = this.gameService.updateBallPosition(
        gameInfo,
        currTime
      );
      gameInfo.timeStamp = currTime;
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
