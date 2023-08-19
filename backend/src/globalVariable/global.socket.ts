import {Injectable} from '@nestjs/common';
import {Socket} from 'socket.io';

interface UserSocket {
  user_id: string;
  socket_id: string;
}

interface UserInfo {
  socket_id: string | null;
  is_gaming: boolean;
}

@Injectable()
export class SocketArray {
  private socketArray = new Map<string, UserInfo>();

  getSocketArray() {
    return this.socketArray;
  }

  getUserSocket(user_id: string) {
    return this.socketArray.get(user_id);
  }

  removeSocketArray(user_id: string) {
    this.socketArray.delete(user_id);
  }

  addSocketArray(userSocket: UserSocket) {
    let userInfo: UserInfo | undefined = this.socketArray.get(
      userSocket.user_id
    );
    userInfo = {
      socket_id: userSocket.socket_id,
      is_gaming: false,
    };
    this.socketArray.set(userSocket.user_id, userInfo);
  }
}
