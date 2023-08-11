import {Injectable} from '@nestjs/common';
import {Socket} from 'socket.io';
import {Coordinate, Ball, GameInfo, DEFAULT_BALL_SPEED} from '@/types/game';
import {RoomInfo} from './types/room-info.interface';
import {EUserIndex} from './types/user-index.enum';
import {gameRooms} from './game.gateway';
import {UserRepository} from 'src/user/user.repository';
import {RecordRepository} from 'src/record/record.repository';
import {ModeRepository} from 'src/record/mode/mode.repository';
import {TypeRepository} from 'src/record/type/type.repository';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_STEP_SIZE = 5;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

const BALL_RADIUS = 10;

const MIN_Y = 0;
const MAX_Y = CANVAS_HEIGHT - PADDLE_HEIGHT;

@Injectable()
export class GameService {
  constructor(
    private userRepository: UserRepository,
    private recordRepository: RecordRepository,
    private modeRepository: ModeRepository,
    private typeRepository: TypeRepository
  ) {}

  initGameInfo = (): GameInfo => {
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
      timeStamp: 0,
      leftPaddle,
      leftScore: 0,
      rightPaddle,
      rightScore: 0,
      ball,
      initialBallVelX: -1,
    };

    return gameInfo;
  };

  isForfeit = (socket: Socket): string | null => {
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
          return null;
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
          return key;
        }
      }
    }
  };

  isLeftUser = (roomInfo: RoomInfo, socket: Socket): boolean => {
    if (socket === roomInfo.users[EUserIndex.LEFT].socket) {
      return true;
    }
    return false;
  };

  updatePaddlePosition = (
    paddle: Coordinate,
    keyUp: boolean,
    keyDown: boolean
  ) => {
    const newY =
      paddle.y +
      (keyDown === true ? PADDLE_STEP_SIZE : 0) -
      (keyUp === true ? PADDLE_STEP_SIZE : 0);
    const clampedY = Math.max(MIN_Y, Math.min(newY, MAX_Y));
    paddle.y = clampedY;
  };

  resetBall = (ball: Ball, gameInfo: GameInfo) => {
    ball.pos.x = CANVAS_WIDTH / 2;
    ball.pos.y = CANVAS_HEIGHT / 2;
    ball.vel.y = 0;
    ball.vel.x = -gameInfo.initialBallVelX;
    gameInfo.initialBallVelX = -gameInfo.initialBallVelX;
  };

  isCollidingPaddle = (ball: Ball, paddle: Coordinate): boolean => {
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

  isGameOver = (gameInfo: GameInfo): boolean => {
    if (gameInfo.leftScore === 5 || gameInfo.rightScore === 5) {
      return true;
    }
    return false;
  };

  updateBallPosition = (gameInfo: GameInfo, currentTime: number): boolean => {
    const {ball, leftPaddle, rightPaddle} = gameInfo;
    const elapse = currentTime - gameInfo.timeStamp;
    ball.pos.x = ball.pos.x + (ball.speed * ball.vel.x * elapse) / 10;
    ball.pos.y = ball.pos.y + (ball.speed * ball.vel.y * elapse) / 10;

    // Check if the ball is colliding with the top or bottom walls
    const isCollidingTop = ball.pos.y - BALL_RADIUS <= 0;
    const isCollidingBottom = ball.pos.y + BALL_RADIUS >= CANVAS_HEIGHT;

    if (isCollidingTop || isCollidingBottom) {
      if (isCollidingTop) {
        ball.pos.y = 0 + BALL_RADIUS;
      } else {
        ball.pos.y = CANVAS_HEIGHT - BALL_RADIUS;
      }
      ball.vel.y = -ball.vel.y;
    }

    const paddle = ball.vel.x < 0 ? leftPaddle : rightPaddle;
    if (this.isCollidingPaddle(ball, paddle)) {
      if (ball.vel.x < 0 && ball.pos.x - BALL_RADIUS <= PADDLE_WIDTH) {
        ball.pos.x = PADDLE_WIDTH + BALL_RADIUS;
      } else if (ball.vel.x > 0 && ball.pos.x + BALL_RADIUS >= paddle.x) {
        ball.pos.x = paddle.x - BALL_RADIUS;
      }

      let collidePoint = ball.pos.y - (paddle.y + PADDLE_HEIGHT / 2);
      collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
      const angleRadian = (Math.PI / 4) * collidePoint;
      const direction = ball.vel.x < 0 ? 1 : -1;
      ball.vel.x = direction * ball.speed * Math.cos(angleRadian); // ?
      ball.vel.y = ball.speed * Math.sin(angleRadian);
      return false;
    }

    // Check if the ball is colliding with the left or right walls
    const isOutOfBoundsLeft = ball.pos.x - BALL_RADIUS <= 0;
    const isOutOfBoundsRight = ball.pos.x + BALL_RADIUS >= CANVAS_WIDTH;

    if (isOutOfBoundsLeft || isOutOfBoundsRight) {
      if (isOutOfBoundsLeft) {
        gameInfo.rightScore += 1;
        if (gameInfo.rightScore === 5) {
          return true;
        }
      } else {
        gameInfo.leftScore += 1;
        if (gameInfo.leftScore === 5) {
          return true;
        }
      }
      this.resetBall(ball, gameInfo);
      return false;
    }
  };

  saveRecord = async (
    roomInfo: RoomInfo,
    isForfeit: boolean,
    socketID: string | null
  ) => {
    const [winner, loser, loser_score] = this.findRecordData(
      roomInfo,
      isForfeit,
      socketID
    );
    if (isForfeit === true) {
      // 몰수패인 경우
      this.setRoomInfoScore(roomInfo, winner);
    }
    const [type, mode] = this.getTypeModeName(roomInfo.type_mode);
    const {game_type, game_mode} = await this.getTypeModeID(type, mode);
    const record = this.recordRepository.create({
      game_type,
      game_mode,
      winner,
      loser,
      winner_score: 5,
      loser_score,
      is_forfeit: isForfeit,
    });
    await this.recordRepository.save(record);
    if (type === 'rank') {
      await this.saveRankScore(winner, true);
      await this.saveRankScore(loser, false);
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

  setRoomInfoScore = (roomInfo: RoomInfo, winner: string) => {
    const winnerLeft = this.isWinnerLeft(roomInfo, winner);
    if (winnerLeft === true) {
      roomInfo.game_info.leftScore = 5;
      roomInfo.game_info.rightScore = 0;
    } else {
      roomInfo.game_info.leftScore = 0;
      roomInfo.game_info.rightScore = 5;
    }
  };

  isWinnerLeft = (roomInfo: RoomInfo, winner: string): boolean => {
    if (winner === roomInfo.users[0].user_id) {
      return true;
    }
    return false;
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
}
