import {Injectable} from '@nestjs/common';
import {Socket} from 'socket.io';

interface UserSocket {
  user_id: string;
  socket_id: string;
}

interface SocketInfo {
  chat_socket: string | null;
  game_socket: string | null;
  is_gaming: boolean;
}

@Injectable()
export class SocketArray {
  private socketArray = new Map<string, SocketInfo>();
  // private socketArray = new Map<string, string>();

  getSocketArray() {
    return this.socketArray;
  }

  getUserSocket(user_id: string) {
    return this.socketArray.get(user_id);
  }

  removeSocketArray(user_id: string) {
    this.socketArray.delete(user_id);
  }

  // addSocketArray(userSocket: UserSocket) {
  //   this.socketArray.set(userSocket.user_id, userSocket.socket_id);
  // }

  addChatSocketArray(userSocket: UserSocket) {
    let socketInfo: SocketInfo | undefined = this.socketArray.get(
      userSocket.user_id
    );
    if (socketInfo !== undefined) {
      socketInfo.chat_socket = userSocket.socket_id;
      return;
    }
    socketInfo = {
      chat_socket: userSocket.socket_id,
      game_socket: null,
      is_gaming: false,
    };
    this.socketArray.set(userSocket.user_id, socketInfo);
  }

  addGameSocketArray(userSocket: UserSocket) {
    let socketInfo: SocketInfo | undefined = this.socketArray.get(
      userSocket.user_id
    );
    if (socketInfo !== undefined) {
      socketInfo.game_socket = userSocket.socket_id;
      return;
    }
    socketInfo = {
      chat_socket: null,
      game_socket: userSocket.socket_id,
      is_gaming: false,
    };
    this.socketArray.set(userSocket.user_id, socketInfo);
  }
}
