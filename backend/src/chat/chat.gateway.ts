import {Logger, UseGuards} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Socket, Namespace} from 'socket.io';
import {ChatService} from './chat.service';
import {SocketArray} from '@/global-variable/global.socket';
import {Block} from '@/global-variable/global.block';
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
export class ChatGateway implements OnGatewayInit {
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
    this.logger.log('웹소켓 서버 초기화');
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, message}: MessagePayload
  ) {
    try {
      const user_id = this.getUserID(socket);

      // 토큰안에 nickname, image도 넣을까?
      // const user_id = socket.handshake.query.user_id as string;
      const user_nickname = socket.handshake.query.nickname as string;
      const user_image = socket.handshake.query.user_image as string;
      const block_members: Set<string> = this.block.getBlockUsers(user_id);
      const except_member: string[] = [];

      if (block_members) {
        block_members.forEach(e => {
          const login_user = this.socketArray.getUserSocket(e);
          if (login_user) {
            except_member.push(login_user.socket_id);
          }
        });
      }
      socket
        .except(except_member)
        .to(`${room_id}`)
        .emit('message', {message, user_id, user_nickname, user_image});
      this.logger.log(`들어온 메세지: ${message}.`);
      return {message, user_id, user_nickname, user_image};
    } catch (e) {
      this.logger.log(e.message);
      // 토큰만료라서 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_id: number
  ): Promise<boolean> {
    try {
      const user_id = this.getUserID(socket);
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
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('room_id') room_id: number
  ) {
    try {
      const user_id = this.getUserID(socket);
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
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('add-admin')
  async handleAddAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    try {
      const user_id = this.getUserID(socket);
      if (await this.chatService.addToAdmin(room_id, user_id, target_id)) {
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
        return true;
      }
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
    return false;
  }

  @SubscribeMessage('del-admin')
  async handleDelAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    try {
      const user_id = this.getUserID(socket);
      if (await this.chatService.delAdmin(room_id, user_id, target_id)) {
        this.nsp.to(`${room_id}`).emit('room-member', {
          members: await this.chatService.getRoomMembers(room_id),
        });
        return true;
      }
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
    return false;
  }

  @SubscribeMessage('mute-member')
  async handleMuteMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id, mute_time}: MutePayload
  ) {
    try {
      const user_id = this.getUserID(socket);
      if (mute_time) {
        await this.chatService.muteMember(
          room_id,
          user_id,
          target_id,
          mute_time
        );
        const login_user = this.socketArray.getUserSocket(target_id);
        if (login_user) {
          socket
            .to(`${room_id}`)
            .to(`${login_user.socket_id}`)
            .emit('mute-member', mute_time);
        }
        return true;
      }
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
    return false;
  }

  // true 면, front에서 leave_room 호출하게. false면 아무것도 안하고 무시 or kick 권한이 없다고 메세지 띄우기.
  @SubscribeMessage('kick-member')
  async handleKickMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    try {
      const user_id = this.getUserID(socket);
      if (await this.chatService.kickMember(room_id, user_id, target_id)) {
        const login_user = this.socketArray.getUserSocket(target_id);
        if (login_user) {
          socket.to(`${login_user.socket_id}`).emit('kick-member');
        }
        return true;
      }
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
    return false;
  }

  @SubscribeMessage('ban-member')
  async handleBanMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    try {
      const user_id = this.getUserID(socket);
      if (await this.handleKickMember(socket, {room_id, target_id})) {
        if (await this.chatService.banMember(room_id, user_id, target_id)) {
          return true;
        }
      }
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
    return false;
  }

  @SubscribeMessage('block-member')
  async handleBlockMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() target_id: string
  ) {
    try {
      const user_id = this.getUserID(socket);
      await this.chatService.blockMember(user_id, target_id);
      socket.emit('block-list');
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('unblock-member')
  async handleUnBlockMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() target_id: string
  ) {
    try {
      const user_id = this.getUserID(socket);
      await this.chatService.unBlockMember(user_id, target_id);
      socket.emit('block-list');
    } catch (e) {
      this.logger.log(e.message);
      if (e.status) {
        return false;
      }
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('chatroom-notification')
  handleNotification(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, target_id}: ExecPayload
  ) {
    try {
      const user_id = this.getUserID(socket);
      const login_user = this.socketArray.getUserSocket(target_id);
      socket
        .to(`${login_user.socket_id}`)
        .emit('chatroom-notification', {room_id, user_id});
      return true;
    } catch (e) {
      this.logger.log(e.message);
      // 토큰만료는 status가 undefined이다. 따라서 이때 socket끊고 로그인페이지로 옮겨버리기
    }
  }

  @SubscribeMessage('update-user-info')
  async handleUpdateUserInfo(@ConnectedSocket() socket: Socket) {
    try {
      const user_id = this.getUserID(socket);
      const user = await this.chatService.getUser(user_id);
      socket.handshake.query.nickname = user.user_nickname;
      socket.handshake.query.image = user.user_image;
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
