import {SocketArray} from '@/globalVariable/global.socket';
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
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('Gateway');
  constructor(
    private jwtService: JwtService,
    private socketArray: SocketArray
  ) {}

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.logger.log('소켓 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결`);
    const userID = this.getUserID(socket);
    this.socketArray.addSocketArray({
      user_id: userID,
      socket_id: socket.id,
    });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userID = this.getUserID(socket);
    this.socketArray.removeSocketArray(userID);
    console.log('user disconnect');
  }

  getUserID = (socket: Socket): string => {
    const jwt: string = socket.handshake.auth.token;
    const decodedToken = this.jwtService.verify(jwt, {
      secret: process.env.SIGNIN_JWT_SECRET_KEY,
    });
    return decodedToken.user_id;
  };
}
