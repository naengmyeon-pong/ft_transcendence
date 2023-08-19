import {SocketArray} from '@/global-variable/global.socket';
import {Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
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
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('UserGateway');
  constructor(
    private jwtService: JwtService,
    private socketArray: SocketArray
  ) {}

  @WebSocketServer() nsp: Namespace;

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 웹소켓 연결`);
    try {
      const userID = this.getUserID(socket);
      this.socketArray.addSocketArray({
        user_id: userID,
        socket_id: socket.id,
      });
    } catch (e) {
      this.logger.log(e.message);
      // socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userID = this.getUserID(socket);
    this.socketArray.removeSocketArray(userID);
    this.logger.log('웹소켓 연결 해제');
  }

  getUserID = (socket: Socket): string => {
    const jwt: string = socket.handshake.auth.token;
    const decodedToken = this.jwtService.verify(jwt, {
      secret: process.env.SIGNIN_JWT_SECRET_KEY,
    });
    return decodedToken.user_id;
  };
}
