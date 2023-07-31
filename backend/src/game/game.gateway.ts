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
} from '@/types/game';
import {UserRepository} from 'src/user/user.repository';
import {RecordRepository} from 'src/record/record.repository';
import {ModeRepository} from 'src/record/mode/mode.repository';
import {TypeRepository} from 'src/record/type/type.repository';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_STEP_SIZE = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

const BALL_RADIUS = 10;
const BALL_SPEED = 5;

const EASY_NORMAL = 1;
const EASY_RANK = 2;
const HARD_NORMAL = 3;
const HARD_RANK = 4;

interface GameUser {
  user_id: string;
  socket: Socket;
  keys: KeyData;
  mode_type: number;
}

interface KeyData {
  up: boolean;
  down: boolean;
}

interface RoomInfo {
  users: GameUser[];
  game_info: GameInfo;
  mode_type: number;
  interval: NodeJS.Timer | null;
}

const waitUserList: GameUser[][] = [];

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
    private typeRepository: TypeRepository
  ) {}

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.logger.log('게임 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결 해제`);
  }

  createGameRoom(userId: string, gameUserSockets: GameUser[]): string {
    const gameInfo = initGameInfo();
    gameRooms.set(userId, {
      users: gameUserSockets,
      game_info: gameInfo,
      mode_type: gameUserSockets[0].mode_type,
      interval: null,
    });
    return userId;
  }

  @SubscribeMessage('join_game')
  handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() joinGameInfo: JoinGameInfo
  ) {
    const keys: KeyData = {up: false, down: false};
    const {user_id} = joinGameInfo;
    const userSocket: GameUser = {user_id, socket, keys, mode_type: -1};
    if (this.isGameMatched(joinGameInfo, userSocket) === false) {
      return;
    } else {
      this.createRoom(userSocket);
    }
  }

  createRoom = (userSocket: GameUser) => {
    const gameUserSockets: GameUser[] = [];
    const firstUser = waitUserList[userSocket.mode_type].shift();
    const secondUser = userSocket;
    const roomName = this.createGameRoom(firstUser.user_id, gameUserSockets);

    gameUserSockets.push(firstUser);
    gameUserSockets.push(secondUser);

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

    this.nsp.to(roomName).emit('room_name', roomUserInfo);
    this.nsp.to(roomName).emit('game_info', {game_info: gameInfo});
  };

  isGameMatched = (
    joinGameInfo: JoinGameInfo,
    userSocket: GameUser
  ): boolean => {
    userSocket.mode_type = this.findModeType(joinGameInfo);
    const gameModeType = userSocket.mode_type;
    if (gameModeType === -1) {
      // join-game-info not found
    }
    if (waitUserList[gameModeType].length === 0) {
      console.log('wait');
      waitUserList[gameModeType].push(userSocket);
      return false;
    } else {
      console.log('join');
      return true;
    }
  };

  findModeType = (joinGameInfo: JoinGameInfo): number => {
    const mode = joinGameInfo.mode;
    const type = joinGameInfo.type;
    let gameModeType = -1;

    if (mode === 'easy') {
      if (type === 'normal') {
        gameModeType = EASY_NORMAL;
      } else if (type === 'rank') {
        gameModeType = EASY_RANK;
      }
    } else if (mode === 'hard') {
      if (type === 'normal') {
        gameModeType = HARD_NORMAL;
      } else if (type === 'rank') {
        gameModeType = HARD_RANK;
      }
    }
    return gameModeType;
  };

  @SubscribeMessage('update_key')
  handleKeyDown(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {room_name, up, down}: {room_name: string; up: boolean; down: boolean}
  ) {
    const roomInfo: RoomInfo = gameRooms.get(room_name);
    const gameInfo: GameInfo = roomInfo.game_info;

    if (isLeftUser(roomInfo, socket) === true) {
      updatePaddlePosition(gameInfo.leftPaddle, up, down);
    } else {
      updatePaddlePosition(gameInfo.rightPaddle, up, down);
    }
  }

  @SubscribeMessage('update_frame')
  handleFrame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_name: string
  ) {
    const roomInfo: RoomInfo = gameRooms.get(room_name);
    const gameInfo: GameInfo = roomInfo.game_info;

    if (roomInfo.interval !== null) {
      return;
    }
    roomInfo.interval = setInterval(() => {
      const gameOver = updateBallPosition(gameInfo);
      this.nsp.to(room_name).emit('game_info', {game_info: gameInfo});
      if (gameOver) {
        clearInterval(roomInfo.interval);
        console.log('game over!');
        this.saveData(roomInfo);
      }
    }, 1000 / 60);
  }

  async saveData(roomInfo: RoomInfo) {
    const {leftScore} = roomInfo.game_info;
    const {rightScore} = roomInfo.game_info;
    let winner_id: string;
    let loser_id: string;
    const winner_score = 5;
    let loser_score: number;
    const is_forfeit = false;
    if (leftScore === 5) {
      winner_id = roomInfo.users[0].user_id;
      loser_id = roomInfo.users[1].user_id;
      loser_score = rightScore;
    } else {
      winner_id = roomInfo.users[1].user_id;
      loser_id = roomInfo.users[0].user_id;
      loser_score = leftScore;
    }

    // 테스트용 게임모드 데이터
    const mode = 'easy_mode';
    let mode_data = await this.modeRepository.findOneBy({mode});
    if (mode_data === null) {
      mode_data = await this.modeRepository.create({
        mode,
      });
      await this.modeRepository.save(mode_data);
    }

    // 테스트용 게임타입 데이터
    const type = 'normal_type';
    let type_data = await this.typeRepository.findOneBy({type});
    if (type_data === null) {
      type_data = await this.typeRepository.create({
        type,
      });
      await this.typeRepository.save(type_data);
    }

    const record = this.recordRepository.create({
      mode_id: mode_data.id,
      type_id: type_data.id,
      winner_id,
      loser_id,
      winner_score,
      loser_score,
      is_forfeit,
    });
    await this.recordRepository.save(record);
  }
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

  const nextX = ball.pos.x + BALL_SPEED * ball.vel.x;
  let nextY = ball.pos.y + BALL_SPEED * ball.vel.y;

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
    ball.vel.x = direction * BALL_SPEED * Math.cos(angleRadian);
    ball.vel.y = BALL_SPEED * Math.sin(angleRadian);
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
