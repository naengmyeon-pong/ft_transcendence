import {Logger} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Namespace, Socket} from 'socket.io';
import {DmService} from './dm.service';
import {Block} from '@/global-variable/global.block';
import {JwtService} from '@nestjs/jwt';
import {SocketArray} from '@/global-variable/global.socket';

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: '*',
  },
})
export class DmGateway {
  constructor(
    private dmService: DmService,
    private block: Block,
    private socketArray: SocketArray,
    private jwtService: JwtService
  ) {}
  private logger = new Logger('DmGateway');
  @WebSocketServer() nsp: Namespace;

  @SubscribeMessage('dm-message')
  async handleDmMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {target_id, message}: {target_id: string; message: string}
  ) {
    const user_id = this.getUserID(socket);
    try {
      const nickname = socket.handshake.query.nickname as string;
      const ban_members = this.block.getBlockUsers(user_id);
      if (ban_members && ban_members.has(target_id)) {
        this.dmService.saveDirectMessage(
          user_id,
          target_id,
          message,
          target_id
        );
      } else {
        const login_user = this.socketArray.getUserSocket(target_id);
        if (login_user) {
          socket.to(`${login_user.socket_id}`).emit('dm-message', {
            message,
            userId: user_id,
            someoneId: target_id,
            nickname,
          });
        }
        this.dmService.saveDirectMessage(user_id, target_id, message);
      }
      return {message, userId: user_id, someoneId: target_id, nickname};
    } catch (e) {
      this.logger.log(e.message);
      return false;
    }
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
