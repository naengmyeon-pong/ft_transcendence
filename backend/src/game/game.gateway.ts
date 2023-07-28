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
import {Coordinate, Ball, GameInfo} from '@/types/game';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_STEP_SIZE = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

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
      this.nsp.to(roomName).emit('room_name', {room_name: roomName});
      this.nsp.to(roomName).emit('game_info', {game_info: gameInfo});
    }
  }

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
    setInterval(() => {
      updateBallPosition(gameInfo);
      this.nsp.to(room_name).emit('game_info', {game_info: gameInfo});
    }, 1000 / 60);
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

const resetBall = (ball: Ball, initialBallVelX: number) => {
  ball.pos.x = CANVAS_WIDTH / 2;
  ball.pos.y = CANVAS_HEIGHT / 2;
  ball.vel.x = -initialBallVelX;
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

const updateBallPosition = (gameInfo: GameInfo) => {
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
    return;
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
    resetBall(ball, gameInfo.initialBallVelX);
    gameInfo.initialBallVelX = -gameInfo.initialBallVelX;
    return;
  }
};

// const findUserBySocket = (socket: Socket): boolean => {};
