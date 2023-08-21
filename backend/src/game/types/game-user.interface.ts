import { Socket } from 'socket.io';
import { KeyData } from './key-data.interface';

export interface GameUser {
  user_id: string;
  socket_id: string;
  keys: KeyData;
  type_mode: number;
}
