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
    try {
      const user_id = this.getUserID(socket);
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
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  getUserID = (socket: Socket): string => {
    const jwt: string = socket.handshake.auth.token;
    const decodedToken = this.jwtService.verify(jwt, {
      secret: process.env.SIGNIN_JWT_SECRET_KEY,
    });
    return decodedToken.user_id;
  };
}
