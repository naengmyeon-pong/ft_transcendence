import {GameUser} from './game-user.interface';
import {GameInfo} from '@/types/game';

export interface RoomInfo {
  room_name: string;
  users: GameUser[];
  game_info: GameInfo;
  type_mode: number;
  interval: NodeJS.Timer | null;
}
