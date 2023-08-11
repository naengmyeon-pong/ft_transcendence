import {Injectable} from '@nestjs/common';

interface UserSocket {
  user_id: string;
  socket_id: string;
}

@Injectable()
export class SocketArray {
  private socketArray = new Map<string, string>();

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
    this.socketArray.set(userSocket.user_id, userSocket.socket_id);
  }
}
