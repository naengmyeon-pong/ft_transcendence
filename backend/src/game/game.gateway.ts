import {Logger} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {number} from 'joi';
import {Namespace, Socket, Server} from 'socket.io';
import {User} from 'src/user/user.entitiy';

interface UserSocket {
  user_id: string;
  socket: Socket;
}

const waitUsers: UserSocket[] = [];
const gameRooms: string[] = [];

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('Gateway');

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.logger.log('게임 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결 해제`);
  }

  createGameRoom(userId: string): string {
    gameRooms.push(userId);
    return userId;
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user_id: string
  ) {
    const userSocket: UserSocket = {user_id, socket: socket};
    if (waitUsers.length === 0) {
      waitUsers.push(userSocket);
    } else {
      const firstUser = waitUsers.shift();
      const roomName = this.createGameRoom(firstUser.user_id);
      firstUser.socket.join(roomName);
      socket.join(roomName);
      socket
        .to(roomName)
        .emit('notice', {notice: `${user_id}이 입장했습니다.`});
    }
  }
}
