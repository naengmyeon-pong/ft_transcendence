import {SocketArray} from '@/global-variable/global.socket';
import {Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Namespace, Socket} from 'socket.io';

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: '*',
  },
})
export class UserGateway implements OnGatewayConnection {
  private logger = new Logger('UserGateway');
  constructor(private socketArray: SocketArray) {}

  @WebSocketServer() nsp: Namespace;

  handleConnection(@ConnectedSocket() socket: Socket) {
    const userID = socket.handshake.query.user_id as string;

    this.socketArray.addSocketArray({
      user_id: userID,
      socket_id: socket.id,
      socket,
    });
    this.logger.log(`${socket.id} 웹소켓 연결`);
  }
}
