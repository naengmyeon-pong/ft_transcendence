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
import {number} from 'joi';
import {Namespace, Socket, Server} from 'socket.io';
import {User} from 'src/user/user.entitiy';

const KEY_CODES = {
  S: 's',
  W: 'w',
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_STEP_SIZE = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_DISTANCE_FROM_WALL = 20;

const BALL_RADIUS = 10;
const BALL_SPEED = 3;

interface GameUser {
  user_id: string;
  socket: Socket;
  keys: KeyData;
}

interface KeyData {
  up: boolean;
  down: boolean;
}

interface Velocity {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

interface Ball {
  pos: Coordinate;
  vel: Velocity;
}

interface GameInfo {
  leftPaddle: Coordinate;
  leftScore: number;
  rightPaddle: Coordinate;
  rightScore: number;
  ball: Ball;
}

interface RoomInfo {
  users: GameUser[];
  game_info: GameInfo;
}

const waitUsers: GameUser[] = [];
const gameRooms: Map<string, RoomInfo> = new Map();

const initGameInfo = (): GameInfo => {
  const leftPaddle: Coordinate = {
    x: 0,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  };
  const rightPaddle: Coordinate = {
    x: CANVAS_WIDTH - PADDLE_DISTANCE_FROM_WALL,
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
  };

  return gameInfo;
};

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
    gameRooms.set(userId, {users: gameUserSockets, game_info: gameInfo});
    return userId;
  }

  @SubscribeMessage('join_game')
  handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user_id: string
  ) {
    const keys: KeyData = {up: false, down: false};
    const userSocket: GameUser = {user_id, socket, keys};
    if (waitUsers.length === 0) {
      // 게임 대기자가 없는 경우 => 대기열에 추가
      console.log('wait');
      waitUsers.push(userSocket);
    } else {
      // 게임 대기자가 있는 경우 => 대기중인 유저와 매칭
      console.log('join');
      const gameUserSockets: GameUser[] = [];
      const firstUser = waitUsers.shift();
      const secondUser = userSocket;
      const roomName = this.createGameRoom(firstUser.user_id, gameUserSockets);

      gameUserSockets.push(firstUser);
      gameUserSockets.push(secondUser);

      firstUser.socket.join(roomName);
      secondUser.socket.join(roomName);
      secondUser.socket
        .to(roomName)
        .emit('notice', {notice: `${user_id}이 입장했습니다.`});

      const roomInfo: RoomInfo = gameRooms.get(roomName);
      const gameInfo: GameInfo = roomInfo.game_info;
      console.log(roomInfo);
      this.nsp.to(roomName).emit('room_name', {room_name: roomName});
      this.nsp.to(roomName).emit('game_info', {game_info: gameInfo});
    }
  }

  @SubscribeMessage('update')
  handleKeyDown(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    {room_name, up, down}: {room_name: string; up: boolean; down: boolean}
  ) {
    console.log('here');
    console.log(room_name, up, down);
    const roomInfo: RoomInfo = gameRooms.get(room_name);
    const gameInfo: GameInfo = roomInfo.game_info;

    updatePaddlePosition(gameInfo.rightPaddle, up, down);
    updateBallPosition(gameInfo);
    this.nsp.to(room_name).emit('game_info', {game_info: gameInfo});
    // const gameUsers: GameUser[] = roomInfo.users;
    // const eventUser = findUserBySocket(socket, gameUsers);
  }
}

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

const resetBall = (ball: Ball) => {
  ball.pos.x = CANVAS_WIDTH / 2;
  ball.pos.y = CANVAS_HEIGHT / 2;
  ball.vel.x = 1;
  ball.vel.y = 0;
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

const updateBallPosition = ({
  ball,
  leftPaddle,
  leftScore,
  rightPaddle,
  rightScore,
}: {
  ball: Ball;
  leftPaddle: Coordinate;
  leftScore: number;
  rightPaddle: Coordinate;
  rightScore: number;
}) => {
  const nextX = ball.pos.x + BALL_SPEED * ball.vel.x;
  let nextY = ball.pos.y + BALL_SPEED * ball.vel.y;

  // Check if the ball is colliding with the left or right walls
  const isOutOfBoundsLeft = nextX - BALL_RADIUS <= 0;
  const isOutOfBoundsRight = nextX + BALL_RADIUS >= CANVAS_WIDTH;

  if (isOutOfBoundsLeft || isOutOfBoundsRight) {
    if (isOutOfBoundsLeft) {
      rightScore += 1;
    } else {
      leftScore += 1;
    }
    resetBall(ball);
    return;
  }

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
  }

  ball.pos.x = nextX;
  ball.pos.y = nextY;
};

// const findUserBySocket = (socket: Socket): boolean => {};
