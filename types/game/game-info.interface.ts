import { Ball } from "./ball.interface";
import { Coordinate } from "./coordinate.interface";

export interface GameInfo {
  leftPaddle: Coordinate;
  leftScore: number;
  rightPaddle: Coordinate;
  rightScore: number;
  ball: Ball;
}
