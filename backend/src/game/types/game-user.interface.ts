import {Socket} from 'socket.io';
import {KeyData} from './key-data.interface';

export interface GameUser {
  user_id: string;
  socket: Socket;
  keys: KeyData;
  type_mode: number;
}
