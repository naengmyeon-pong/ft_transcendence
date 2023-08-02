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
import {
  Coordinate,
  Ball,
  GameInfo,
  RoomUserInfo,
  JoinGameInfo,
  DEFAULT_BALL_SPEED,
} from '@/types/game';
import {UserRepository} from 'src/user/user.repository';
import {RecordRepository} from 'src/record/record.repository';
import {ModeRepository} from 'src/record/mode/mode.repository';
import {TypeRepository} from 'src/record/type/type.repository';
import {JwtService} from '@nestjs/jwt';
import {boolean} from 'joi';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_STEP_SIZE = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

const BALL_RADIUS = 10;

const NORMAL_EASY = 0;
const NORMAL_HARD = 1;
const RANK_EASY = 2;
const RANK_HARD = 3;

interface GameUser {
  user_id: string;
  socket: Socket;
  keys: KeyData;
  type_mode: number;
}

interface KeyData {
  up: boolean;
  down: boolean;
}

interface RoomInfo {
  room_name: string;
  users: GameUser[];
  game_info: GameInfo;
  type_mode: number;
  interval: NodeJS.Timer | null;
}

const waitUserList: GameUser[][] = [[], [], [], []];

const gameRooms: Map<string, RoomInfo> = new Map();

const initGameInfo = (): GameInfo => {
  const leftPaddle: Coordinate = {
    x: 0,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  };
  const rightPaddle: Coordinate = {
    x: CANVAS_WIDTH - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  };
  const ball: Ball = {
    pos: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    },
    vel: {
      x: -1,
      y: 0,
    },
    speed: DEFAULT_BALL_SPEED,
  };
  const gameInfo: GameInfo = {
    leftPaddle,
    leftScore: 0,
    rightPaddle,
    rightScore: 0,
    ball,
    initialBallVelX: -1,
  };

  return gameInfo;
};

enum EUserIndex {
  LEFT = 0,
  RIGHT = 1,
}

const maxY = CANVAS_HEIGHT - PADDLE_HEIGHT;
const minY = 0;

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
    this.checkForfeit(socket);
    this.logger.log(`${socket.id} 게임 소켓 연결 해제`);
  }

  checkForfeit = (socket: Socket) => {
    for (const [key, value] of gameRooms) {
      if (
        socket.id === value.users[0].socket.id ||
        socket.id === value.users[1].socket.id
      ) {
        // 소켓이 gameRooms에 존재하는 경우
        if (
          value.game_info.leftScore === 5 ||
          value.game_info.rightScore === 5
        ) {
          // 정상 종료된 경우
          return;
        } else {
          // 비정상 종료된 경우 => 몰수패 처리
          let loserID: string;
          let winnerID: string;
          if (socket.id === value.users[0].socket.id) {
            loserID = value.users[0].user_id;
            winnerID = value.users[1].user_id;
          } else {
            winnerID = value.users[0].user_id;
            loserID = value.users[1].user_id;
          }
          this.saveRecord(value, true, socket.id);
          this.sendGameInfo(value);
          clearInterval(value.interval);
        }
        gameRooms.delete(key);
        return;
      }
    }
  };

  saveRecord = async (
    roomInfo: RoomInfo,
    isForfeit: boolean,
    socketID: string | null
  ) => {
    const [winner_id, loser_id, loser_score] = this.findRecordData(
      roomInfo,
      isForfeit,
      socketID
    );
    if (isForfeit === true) {
      // 몰수패인 경우
      this.setRoomInfoScore(roomInfo, winner_id);
    }
    const [type, mode] = this.getTypeModeName(roomInfo.type_mode);
    const {game_type, game_mode} = await this.getTypeModeID(type, mode);
    const record = this.recordRepository.create({
      game_type,
      game_mode,
      winner_id,
      loser_id,
      winner_score: 5,
      loser_score,
      is_forfeit: isForfeit,
    });
    await this.recordRepository.save(record);
    if (type === 'rank') {
      await this.saveRankScore(winner_id, true);
      await this.saveRankScore(loser_id, false);
    }
  };

  saveRankScore = async (userId: string, isWinner: boolean) => {
    const user = await this.userRepository.findOneBy({user_id: userId});
    if (user === null) {
      // user not found
      console.log('user not found');
      return;
    }

    let score: number;
    if (isWinner === true) {
      score = 3;
    } else {
      score = -1;
    }

    const rankScore = user.rank_score;
    const resultRankScore = rankScore + score;
    if (
      this.isUnderMinRankScore(resultRankScore) ||
      this.isOverMaxRankScore(resultRankScore)
    ) {
      return;
    }
    user.rank_score += score;
    await this.userRepository.save(user);
  };

  isUnderMinRankScore = (score: number): boolean => {
    return score < 0;
  };

  isOverMaxRankScore = (score: number): boolean => {
    return score >= 1000000 && score.toString().length >= 1000;
  };

  findRecordData = (
    roomInfo: RoomInfo,
    isForfeit: boolean,
    socketID: string | null
  ): [string, string, number] => {
    let loserID: string;
    let winnerID: string;
    let loser_score = 0;
    if (isForfeit === true) {
      if (socketID === roomInfo.users[0].socket.id) {
        loserID = roomInfo.users[0].user_id;
        winnerID = roomInfo.users[1].user_id;
      } else {
        winnerID = roomInfo.users[0].user_id;
        loserID = roomInfo.users[1].user_id;
      }
    } else {
      const {leftScore} = roomInfo.game_info;
      const {rightScore} = roomInfo.game_info;
      if (leftScore === 5) {
        winnerID = roomInfo.users[0].user_id;
        loserID = roomInfo.users[1].user_id;
        loser_score = rightScore;
      } else {
        winnerID = roomInfo.users[1].user_id;
        loserID = roomInfo.users[0].user_id;
        loser_score = leftScore;
      }
    }
    return [winnerID, loserID, loser_score];
  };

  setRoomInfoScore = (roomInfo: RoomInfo, winner_id: string) => {
    const winnerLeft = this.isWinnerLeft(roomInfo, winner_id);
    if (winnerLeft === true) {
      roomInfo.game_info.leftScore = 5;
      roomInfo.game_info.rightScore = 0;
    } else {
      roomInfo.game_info.leftScore = 0;
      roomInfo.game_info.rightScore = 5;
    }
  };

  isWinnerLeft = (roomInfo: RoomInfo, winner_id: string): boolean => {
    if (winner_id === roomInfo.users[0].user_id) {
      return true;
    }
    return false;
  };

  getTypeModeName = (type_mode: number): [string, string] => {
    let type: string;
    let mode: string;
    switch (type_mode) {
      case 0:
        type = 'normal';
        mode = 'easy';
        break;
      case 1:
        type = 'normal';
        mode = 'hard';
        break;
      case 2:
        type = 'rank';
        mode = 'easy';
        break;
      case 3:
        type = 'rank';
        mode = 'hard';
        break;
    }
    return [type, mode];
  };

  getTypeModeID = async (
    type: string,
    mode: string
  ): Promise<{game_type: number; game_mode: number}> => {
    let type_Record = await this.typeRepository.findOneBy({type});
    if (type_Record === null) {
      type_Record = this.typeRepository.create({
        type,
      });
      await this.typeRepository.save(type_Record);
    }
    let mode_Record = await this.modeRepository.findOneBy({mode});
    if (mode_Record === null) {
      mode_Record = this.modeRepository.create({
        mode,
      });
      await this.modeRepository.save(mode_Record);
    }
    return {game_type: type_Record.id, game_mode: mode_Record.id};
  };

  createGameRoom(userId: string, gameUserSockets: GameUser[]): string {
    const gameInfo = initGameInfo();

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
    const typeMode = this.findTypeMode(joinGameInfo);
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
    userSocket.type_mode = this.findTypeMode(joinGameInfo);
    const gameTypeMode = userSocket.type_mode;
    if (gameTypeMode === -1) {
      // join-game-info not found
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

  findTypeMode = (joinGameInfo: JoinGameInfo): number => {
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

  @SubscribeMessage('update_key')
  handleKeyDown(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {room_name, up, down}: {room_name: string; up: boolean; down: boolean}
  ) {
    const roomInfo: RoomInfo = gameRooms.get(room_name);

    if (isLeftUser(roomInfo, socket) === true) {
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
    roomInfo.interval = setInterval(() => {
      const gameOver = updateBallPosition(gameInfo);
      this.sendGameInfo(roomInfo);
      updatePaddlePosition(
        gameInfo.leftPaddle,
        leftUserKeyState.up,
        leftUserKeyState.down
      );
      updatePaddlePosition(
        gameInfo.rightPaddle,
        rightUserKeyState.up,
        rightUserKeyState.down
      );
      if (gameOver === true) {
        // 게임이 정상 종료된 경우
        clearInterval(roomInfo.interval);
        console.log('game over!');
        this.saveRecord(roomInfo, false, null);
        gameRooms.delete(roomInfo.room_name);
      }
    }, 1000 / 60);
  }

  sendGameInfo = (roomInfo: RoomInfo) => {
    this.nsp
      .to(roomInfo.room_name)
      .emit('game_info', {game_info: roomInfo.game_info});
  };
}

const isLeftUser = (roomInfo: RoomInfo, socket: Socket): boolean => {
  if (socket === roomInfo.users[EUserIndex.LEFT].socket) {
    return true;
  }
  return false;
};

const updatePaddlePosition = (
  paddle: Coordinate,
  keyUp: boolean,
  keyDown: boolean
) => {
  const newY =
    paddle.y +
    (keyDown === true ? PADDLE_STEP_SIZE : 0) -
    (keyUp === true ? PADDLE_STEP_SIZE : 0);
  const clampedY = Math.max(minY, Math.min(newY, maxY));
  paddle.y = clampedY;
};

const resetBall = (
  ball: Ball,
  initialBallVelX: number,
  is_game_over: boolean
) => {
  ball.pos.x = CANVAS_WIDTH / 2;
  ball.pos.y = CANVAS_HEIGHT / 2;
  ball.vel.y = 0;
  if (is_game_over === false) {
    // game not over
    ball.vel.x = -initialBallVelX;
  } else {
    ball.vel.x = 0;
  }
};

const isCollidingPaddle = (ball: Ball, paddle: Coordinate): boolean => {
  const isCollidingPaddleLeft = paddle.x <= ball.pos.x + BALL_RADIUS;
  const isCollidingPaddleRight =
    paddle.x + PADDLE_WIDTH >= ball.pos.x - BALL_RADIUS;
  const isCollidingPaddleTop = paddle.y <= ball.pos.y + BALL_RADIUS;
  const isCollidingPaddleBottom =
    paddle.y + PADDLE_HEIGHT >= ball.pos.y - BALL_RADIUS;

  return (
    isCollidingPaddleLeft &&
    isCollidingPaddleRight &&
    isCollidingPaddleTop &&
    isCollidingPaddleBottom
  );
};

const isGameOver = (gameInfo: GameInfo): boolean => {
  if (gameInfo.leftScore === 5 || gameInfo.rightScore === 5) {
    return true;
  }
  return false;
};

const updateBallPosition = (gameInfo: GameInfo): boolean => {
  const {ball, leftPaddle, rightPaddle} = gameInfo;

  const nextX = ball.pos.x + ball.speed * ball.vel.x;
  let nextY = ball.pos.y + ball.speed * ball.vel.y;

  ball.pos.x = nextX;
  ball.pos.y = nextY;
  // Check if the ball is colliding with the top or bottom walls
  const isCollidingTop = nextY - BALL_RADIUS <= 0;
  const isCollidingBottom = nextY + BALL_RADIUS >= CANVAS_HEIGHT;

  if (isCollidingTop || isCollidingBottom) {
    if (isCollidingTop) {
      nextY = 0 + BALL_RADIUS;
    } else {
      nextY = CANVAS_HEIGHT - BALL_RADIUS;
    }
    ball.vel.y = -ball.vel.y;
  }

  const paddle = ball.vel.x < 0 ? leftPaddle : rightPaddle;

  if (isCollidingPaddle(ball, paddle)) {
    let collidePoint = nextY - (paddle.y + PADDLE_HEIGHT / 2);
    collidePoint = collidePoint / (PADDLE_HEIGHT / 2);

    const angleRadian = (Math.PI / 4) * collidePoint;
    const direction = ball.pos.x + BALL_RADIUS < CANVAS_WIDTH / 2 ? 1 : -1;
    ball.vel.x = direction * ball.speed * Math.cos(angleRadian);
    ball.vel.y = ball.speed * Math.sin(angleRadian);
    // if (ball.vel.x < 0) {
    //   if (ball.pos.x - BALL_RADIUS < PADDLE_WIDTH) {
    //     ball.pos.x = PADDLE_WIDTH + BALL_RADIUS;
    //   }
    // } else {
    //   if (ball.pos.x + BALL_RADIUS > CANVAS_WIDTH - PADDLE_WIDTH) {
    //     ball.pos.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_RADIUS;
    //   }
    // }
    return false;
  }

  // Check if the ball is colliding with the left or right walls
  const isOutOfBoundsLeft = nextX - BALL_RADIUS <= 0;
  const isOutOfBoundsRight = nextX + BALL_RADIUS >= CANVAS_WIDTH;

  if (isOutOfBoundsLeft || isOutOfBoundsRight) {
    if (isOutOfBoundsLeft) {
      // if (
      //   gameInfo.ball.pos.y >= gameInfo.leftPaddle.y &&
      //   gameInfo.ball.pos.y <= gameInfo.leftPaddle.y + PADDLE_HEIGHT
      // ) {
      //   gameInfo.ball.pos.x = PADDLE_WIDTH + BALL_RADIUS;
      //   console.log('left collding');
      //   return;
      // }
      gameInfo.rightScore += 1;
    } else {
      // if (
      //   gameInfo.ball.pos.y >= gameInfo.rightPaddle.y &&
      //   gameInfo.ball.pos.y <= gameInfo.rightPaddle.y + PADDLE_HEIGHT
      // ) {
      //   gameInfo.ball.pos.x = CANVAS_WIDTH - (PADDLE_WIDTH + BALL_RADIUS);
      //   console.log('right collding');
      //   return;
      // }
      gameInfo.leftScore += 1;
    }
    const gameOver = isGameOver(gameInfo);
    resetBall(ball, gameInfo.initialBallVelX, gameOver);
    if (gameOver === false) {
      // game not over
      gameInfo.initialBallVelX = -gameInfo.initialBallVelX;
      return false;
    } else {
      // game over
      return true;
    }
    // return false;
  }
};

// const findUserBySocket = (socket: Socket): boolean => {};
