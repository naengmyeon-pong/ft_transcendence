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
  constructor(
    private jwtService: JwtService,
    private socketArray: SocketArray
  ) {}

  @WebSocketServer() nsp: Namespace;

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 웹소켓 연결`);
    const userID = socket.handshake.query.user_id as string;

    this.socketArray.addSocketArray({
      user_id: userID,
      socket_id: socket.id,
    });
  }

  getUserID = (socket: Socket): string => {
    try {
      const jwt: string = socket.handshake.auth.token;
      const decodedToken = this.jwtService.verify(jwt, {
        secret: process.env.SIGNIN_JWT_SECRET_KEY,
      });
      return decodedToken.user_id;
    } catch (e) {
      this.logger.log('token expire');
      socket.emit('token-expire');
    }
  };
}
