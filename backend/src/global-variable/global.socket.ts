import {BadRequestException, Injectable} from '@nestjs/common';
import {Socket} from 'socket.io';

interface UserSocket {
  user_id: string;
  socket_id: string;
  socket: Socket;
}

interface UserInfo {
  socket_id: string | null;
  socket: Socket | null;
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
      socket: userSocket.socket,
      is_gaming: false,
    };
    this.socketArray.set(userSocket.user_id, userInfo);
  }

  getUser = (socket: Socket): string => {
    this.socketArray.forEach((value, key) => {
      if (value.socket_id === socket.id) {
        return key;
      }
    });
    throw new BadRequestException('Socket not found in User list.');
  };
}
