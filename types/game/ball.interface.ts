import { Coordinate } from "./coordinate.interface";
import { Velocity } from "./velocity.interface";

export interface Ball {
  pos: Coordinate;
  vel: Velocity;
  speed: number;
}
