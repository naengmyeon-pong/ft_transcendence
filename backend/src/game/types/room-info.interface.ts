import {GameUser} from './game-user.interface';
import {GameInfo} from '@/types/game';
import {ETypeMode} from './type-mode.enum';

export interface RoomInfo {
  room_name: string;
  users: GameUser[];
  game_info: GameInfo;
  type_mode: ETypeMode;
  interval: NodeJS.Timer | null;
}
