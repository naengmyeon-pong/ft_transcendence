import {Logger} from '@nestjs/common';
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

interface MessagePayload {
  room_id: number;
  message: string;
}

interface ExecPayload {
  room_id: number;
  target_id: string;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private chatService: ChatService,
    private socketArray: SocketArray
  ) {}
  @WebSocketServer() nsp: Namespace;

  private logger = new Logger('ChatGateway');

  afterInit() {
    this.logger.log('웹소켓 서버 초기화 ✅');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const user_id = socket.handshake.query.user_id as string;
    const room_id = socket.handshake.query.room_id as string;
    this.logger.log(
      `${user_id} socket room id: ${socket.handshake.query.room_id}`
    );
    // await this.chatService.socketConnection(socket.id, user_id);
    if (room_id !== 'undefined') {
      const room_id_to_num = Number(room_id);
      await this.handleLeaveRoom(socket, room_id_to_num);
      await this.handleJoinRoomInConnection(socket, room_id_to_num);
      socket.handshake.query.room_id = 'undefined';
    }
    this.socketArray.addSocketArray({user_id, socket_id: socket.id});
    this.logger.log(`${socket.id} 소켓 연결`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user_id = socket.handshake.query.user_id as string;
    // await this.chatService.socketDisconnection(user_id);
    this.socketArray.removeSocketArray(user_id);
    this.logger.log(`${socket.id} 소켓 연결 해제 ❌`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, message}: MessagePayload
  ) {
    socket.to(`${room_id}`).emit('message', {username: socket.id, message}); //front로 메세지 전송

    this.logger.log(`들어온 메세지: ${message}.`);
    return {username: socket.id, message};
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_id: number
  ): Promise<boolean> {
    const user_id = socket.handshake.query.user_id as string;
    const query_room_id = socket.handshake.query.room_id as string;
    if (query_room_id !== 'undefined') {
      return true;
    }

    console.log('join_room start');
    try {
      await this.chatService.joinRoom(room_id, user_id);
    } catch (e) {
      console.log('join error: ', e.message);
      return false;
    }
    socket.join(`${room_id}`);
    socket.to(`${room_id}`).emit('message', {
      message: `${socket.handshake.query.nickname}가 들어왔습니다.`,
    });
    // console.log('join-room: ', socket.handshake.query.nickname);
    this.nsp.to(`${room_id}`).emit('room-member', {
      members: await this.chatService.getRoomMembers(room_id),
    });
    console.log('join_room end');
    return true;
  }

  async handleJoinRoomInConnection(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_id: number
  ): Promise<boolean> {
    console.log('join_room in connection start');
    const user_id = socket.handshake.query.user_id as string;
    try {
      await this.chatService.joinRoom(room_id, user_id);
    } catch (e) {
      console.log('join error: ', e.message);
      return false;
    }
    socket.join(`${room_id}`);
    socket.to(`${room_id}`).emit('message', {
      message: `${socket.handshake.query.nickname}가 들어왔습니다.`,
    });
    // console.log('join-room: ', socket.handshake.query.nickname);
    this.nsp.to(`${room_id}`).emit('room-member', {
      members: await this.chatService.getRoomMembers(room_id),
    });
    console.log('join_room in connection end');
    return true;
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room_id: number
  ) {
    console.log('leave-room start');
    const user_id = socket.handshake.query.user_id as string;
    // console.log('leave-room: ', socket.handshake.query.nickname);
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
      console.log('leave-room end');
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
    if (await this.chatService.addToAdmin(room_id, user_id, target_id)) {
      this.nsp.to(`${room_id}`).emit('room-member', {
        members: await this.chatService.getRoomMembers(room_id),
      });
      return true;
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
    if (await this.chatService.kickMember(room_id, user_id, target_id)) {
      return true;
    }
    return false;
  }

  // socket.to(`${room_id}`).emit('room-member', this.chatService.getRoomMembers(room_id));
}
