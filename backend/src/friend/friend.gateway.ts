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
import {ChatMember} from '@/chat/chat.entity';

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
    const user_id = socket.handshake.query.user_id as string;
    await this.updateFriendState(user_id, socket, '온라인');
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user_id = socket.handshake.query.user_id as string;
    await this.updateFriendState(user_id, socket, '오프라인');
  }

  async updateFriendState(user_id: string, socket: Socket, state: string) {
    const friends = await this.friendService.getUsersAsFriend(user_id);
    friends.forEach(friend => {
      const login_user = this.socketArray.getUserSocket(friend.userId);
      if (login_user) {
        socket
          .to(login_user.socket_id)
          .emit('update-friend-state', {userId: user_id, state});
      }
    });
  }

  // state 0 = 오프라인, 1 = 온라인, 2 = 게임중
  @SubscribeMessage('friend-list')
  async handleFriendList(@ConnectedSocket() socket: Socket) {
    const user_id = await this.getUserID(socket);
    if (!user_id) {
      return false;
    }
    try {
      const friend_list = await this.friendService.getFriendList(user_id);
      socket.emit('friend-list', friend_list);
      return true;
    } catch (e) {
      this.logger.log(e.message);
      return false;
    }
  }

  @SubscribeMessage('add-friend')
  async handleAddFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friend_id: string
  ) {
    const user_id = await this.getUserID(socket);
    if (!user_id) {
      return false;
    }
    try {
      await this.friendService.addFriend(user_id, friend_id);
      return await this.handleFriendList(socket);
    } catch (e) {
      this.logger.log(e.message);
      return false;
    }
  }

  @SubscribeMessage('del-friend')
  async handleDelFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friend_id: string
  ) {
    const user_id = await this.getUserID(socket);
    if (!user_id) {
      return false;
    }
    try {
      await this.friendService.delFriend(user_id, friend_id);
      return await this.handleFriendList(socket);
    } catch (e) {
      this.logger.log(e.message);
      return false;
    }
  }

  async getUserID(socket: Socket): Promise<string> {
    try {
      const jwt: string = socket.handshake.auth.token;
      const decodedToken = this.jwtService.verify(jwt, {
        secret: process.env.SIGNIN_JWT_SECRET_KEY,
      });
      return decodedToken.user_id;
    } catch (e) {
      this.logger.log('token expire');
      let member: ChatMember = undefined;
      try {
        member = await this.friendService.isChatMember(
          socket.handshake.query.user_id as string
        );
      } catch (e) {
        console.log(e.message);
      }
      if (member) {
        socket.emit('token-expire', member.chatroomId);
      } else {
        socket.emit('token-expire');
      }
    }
  }
}
