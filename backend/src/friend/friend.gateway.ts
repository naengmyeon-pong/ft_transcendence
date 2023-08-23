import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {FriendService} from './friend.service';
import {Namespace, Socket} from 'socket.io';
import {JwtService} from '@nestjs/jwt';
import {Logger} from '@nestjs/common';
import {SocketArray} from '@/global-variable/global.socket';

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: '*',
  },
})
export class FriendGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private friendService: FriendService,
    private jwtService: JwtService,
    private socketArray: SocketArray
  ) {}

  @WebSocketServer() nsp: Namespace;

  private logger = new Logger('friendGateway');

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const user_id = this.getUserID(socket);
      const friends = await this.friendService.getUsersAsFriend(user_id);
      friends.forEach(friend => {
        const login_user = this.socketArray.getUserSocket(friend.userId);
        if (login_user) {
          socket
            .to(login_user.socket_id)
            .emit('update-friend-state', {userId: user_id, state: '온라인'});
        }
      });
    } catch (e) {
      this.logger.log(e.message);
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const user_id = this.getUserID(socket);
      const friends = await this.friendService.getUsersAsFriend(user_id);
      friends.forEach(friend => {
        const login_user = this.socketArray.getUserSocket(friend.userId);
        if (login_user) {
          socket
            .to(login_user.socket_id)
            .emit('update-friend-state', {userId: user_id, state: '오프라인'});
        }
      });
    } catch (e) {
      this.logger.log(e.message);
    }
  }

  // state 0 = 오프라인, 1 = 온라인, 2 = 게임중
  @SubscribeMessage('friend-list')
  async handleFriendList(@ConnectedSocket() socket: Socket) {
    try {
      const user_id = this.getUserID(socket);
      const friend_list = await this.friendService.getFriendList(user_id);
      socket.emit('friend-list', friend_list);
      return true;
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('add-friend')
  async handleAddFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friend_id: string
  ) {
    try {
      const user_id = this.getUserID(socket);
      await this.friendService.addFriend(user_id, friend_id);
      return await this.handleFriendList(socket);
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('del-friend')
  async handleDelFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friend_id: string
  ) {
    try {
      const user_id = this.getUserID(socket);
      await this.friendService.delFriend(user_id, friend_id);
      return await this.handleFriendList(socket);
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
