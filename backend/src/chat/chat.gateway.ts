import {Logger, UseGuards} from '@nestjs/common';
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
import {Socket, Namespace} from 'socket.io';
import {ChatService} from './chat.service';
import {SocketArray} from 'src/globalVariable/global.socket';
import {Block} from 'src/globalVariable/global.block';
import {AuthGuard} from '@nestjs/passport';
import {JwtService} from '@nestjs/jwt';

interface MessagePayload {
  room_id: number;
  message: string;
}

interface ExecPayload {
  room_id: number;
  target_id: string;
}

interface MutePayload {
  room_id: number;
  target_id: string;
  mute_time: string;
}

@WebSocketGateway({
  namespace: 'pong',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private chatService: ChatService,
    private socketArray: SocketArray,
    private block: Block,
    private jwtService: JwtService
  ) {}
  @WebSocketServer() nsp: Namespace;

  private logger = new Logger('ChatGateway');

  afterInit() {
    this.block.setBlock();
    this.logger.log('웹소켓 서버 초기화 ✅');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const token = this.jwtService.verify(socket.handshake.auth.token);
      const user_id = token.user_id;
      this.socketArray.addSocketArray({user_id, socket_id: socket.id});
      this.logger.log(`${socket.id} 채팅 소켓 연결`);
    } catch (e) {
      // 연결했을 때 토큰이 이상하거나 없으면 그대로 끊어버림.
      socket.disconnect();
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, message}: MessagePayload
  ) {
    try {
      this.jwtService.verify(socket.handshake.auth.token);
    } catch (e) {
      // front한테 socket 이벤트 줄거임. 그러면 토큰 삭제하고 로그인페이지로 이동시키기.
      return;
    }
    const user_id = socket.handshake.query.user_id as string;
    const user_nickname = socket.handshake.query.nickname as string;
    const user_image = socket.handshake.query.user_image as string;
    const block_members: Set<string> = this.block.getBlockUsers(user_id);
    const except_member: string[] = [];

    if (block_members) {
      block_members.forEach(e => {
        except_member.push(this.socketArray.getUserSocket(e));
      });
    }
    socket
      .except(except_member)
      .to(`${room_id}`)
      .emit('message', {message, user_id, user_nickname, user_image});
    this.logger.log(`들어온 메세지: ${message}.`);
    return {message, user_id, user_nickname, user_image};
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_id: number
  ): Promise<boolean> {
    const user_id = socket.handshake.query.user_id as string;
    try {
      if (await this.chatService.joinRoom(room_id, user_id)) {
        socket.join(`${room_id}`);
        socket.to(`${room_id}`).emit('message', {
          message: `${socket.handshake.query.nickname}가 들어왔습니다.`,
        });
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
        return true;
      } else {
        socket.join(`${room_id}`);
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
      }
    } catch (e) {
      console.log('join error: ', e.message);
      return false;
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('room_id') room_id: number
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      const leave = await this.chatService.leaveRoom(room_id, user_id);
      socket.leave(`${room_id}`);

      if (leave && leave.permission === 2) {
        socket.to(`${room_id}`).emit('leave-room', true);
      } else if (leave) {
        socket.to(`${room_id}`).emit('message', {
          message: `${socket.handshake.query.nickname}가 나갔습니다.`,
        });
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
      }
      return true;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }

  @SubscribeMessage('add-admin')
  async handleAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      if (await this.chatService.addToAdmin(room_id, user_id, target_id)) {
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
        return true;
      }
    } catch (e) {
      console.log(e.message);
    }
    return false;
  }

  @SubscribeMessage('del-admin')
  async handleDelAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      if (await this.chatService.delAdmin(room_id, user_id, target_id)) {
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
        return true;
      }
    } catch (e) {
      console.log(e.message);
    }
    return false;
  }

  @SubscribeMessage('mute-member')
  async handleMuteMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id, mute_time}: MutePayload
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      if (mute_time) {
        await this.chatService.muteMember(
          room_id,
          user_id,
          target_id,
          mute_time
        );
        const target_socket_id = this.socketArray.getUserSocket(target_id);
        socket
          .to(`${room_id}`)
          .to(`${target_socket_id}`)
          .emit('mute-member', mute_time);
        return true;
      }
    } catch (e) {
      console.log(e.message);
    }
    return false;
  }

  // true 면, front에서 leave_room 호출하게. false면 아무것도 안하고 무시 or kick 권한이 없다고 메세지 띄우기.
  @SubscribeMessage('kick-member')
  async handleKickMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      if (await this.chatService.kickMember(room_id, user_id, target_id)) {
        const target_socket_id = this.socketArray.getUserSocket(target_id);
        socket.to(`${target_socket_id}`).emit('kick-member');
        return true;
      }
    } catch (e) {
      console.log(e.message);
    }
    return false;
  }

  @SubscribeMessage('ban-member')
  async handleBanMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      if (await this.handleKickMember(socket, {room_id, target_id})) {
        if (await this.chatService.banMember(room_id, user_id, target_id)) {
          return true;
        }
      }
    } catch (e) {
      console.log(e.message);
    }
    return false;
  }

  @SubscribeMessage('block-member')
  async handleBlockMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() target_id: string
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      await this.chatService.blockMember(user_id, target_id);
      socket.emit('block-list');
    } catch (e) {
      console.log(e.message);
    }
  }

  @SubscribeMessage('unblock-member')
  async handleUnBlockMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() target_id: string
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      await this.chatService.unBlockMember(user_id, target_id);
      socket.emit('block-list');
    } catch (e) {
      console.log(e.message);
    }
  }

  @SubscribeMessage('update-user-info')
  async handleUpdateUserInfo(@ConnectedSocket() socket: Socket) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      const user = await this.chatService.getUser(user_id);
      socket.handshake.query.nickname = user.user_nickname;
      socket.handshake.query.image = user.user_image;
    } catch (e) {
      console.log(e.message);
    }
  }

  @SubscribeMessage('dm-message')
  async handleDmMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {target_id, message}: {target_id: string; message: string}
  ) {
    const user_id = socket.handshake.query.user_id as string;
    const nickname = socket.handshake.query.nickname as string;

    try {
      const ban_members = this.block.getBlockUsers(user_id);
      if (ban_members && ban_members.has(target_id)) {
        this.chatService.saveDirectMessage(
          user_id,
          target_id,
          message,
          target_id
        );
      } else {
        const target_socket_id = this.socketArray.getUserSocket(target_id);
        socket.to(`${target_socket_id}`).emit('dm-message', {
          message,
          userId: user_id,
          someoneId: target_id,
          nickname,
        });
        this.chatService.saveDirectMessage(user_id, target_id, message);
      }
    } catch (e) {
      console.log(e.message);
    }
    return {message, userId: user_id, someoneId: target_id, nickname};
  }

  @SubscribeMessage('chatroom-notification')
  handleNotification(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    const user_id = socket.handshake.query.user_id as string;
    const target_socket_id = this.socketArray.getUserSocket(target_id);
    socket
      .to(`${target_socket_id}`)
      .emit('chatroom-notification', {room_id, user_id});
    return true;
  }

  @SubscribeMessage('friend-list')
  async handleFriendList(@ConnectedSocket() socket: Socket) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      const friend_list = await this.chatService.getFriendList(user_id);
      socket.emit('friend-list', friend_list);
      return true;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }

  @SubscribeMessage('add-friend')
  async handleAddFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friend_id: string
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      await this.chatService.addFriend(user_id, friend_id);
      return await this.handleFriendList(socket);
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }

  @SubscribeMessage('del-friend')
  async handleDelFriend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() friend_id: string
  ) {
    const user_id = socket.handshake.query.user_id as string;
    try {
      await this.chatService.delFriend(user_id, friend_id);
      return await this.handleFriendList(socket);
    } catch (e) {
      console.log(e.message);
      return false;
    }
  }
}
