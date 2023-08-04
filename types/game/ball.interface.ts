import { Coordinate } from "./coordinate.interface";
import { Velocity } from "./velocity.interface";

export const DEFAULT_BALL_SPEED = 2;

export interface Ball {
  pos: Coordinate;
  vel: Velocity;
  speed: number;
}
