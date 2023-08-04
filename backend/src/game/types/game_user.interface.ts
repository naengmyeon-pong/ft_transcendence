import {Socket} from 'socket.io';
import {KeyData} from './key_data.interface';

export interface GameUser {
  user_id: string;
  socket: Socket;
  keys: KeyData;
  type_mode: number;
}
