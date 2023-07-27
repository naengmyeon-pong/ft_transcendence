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
import {
  ChatBanRepository,
  ChatMemberRepository,
  ChatRoomRepository,
  SocketRepository,
} from './chat.repository';
import {ChatService} from './chat.service';

interface MessagePayload {
  room_id: number;
  message: string;
}

interface JoinPayload {
  room_id: number;
  nickname: string;
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
    private chatRoomRepository: ChatRoomRepository,
    private chatMemberRepository: ChatMemberRepository,
    private chatBanRepository: ChatBanRepository,
    private socketId: SocketRepository,
    private chatService: ChatService
  ) {}
  @WebSocketServer() nsp: Namespace;

  private logger = new Logger('ChatGateway');

  afterInit() {
    this.logger.log('웹소켓 서버 초기화 ✅');
  }

  async handleConnection(@ConnectedSocket() socket: Socket, user_id: string) {
    // await this.chatService.socketConnection(socket.id, user_id);
    this.logger.log(`${socket.id} 소켓 연결`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    // await this.chatService.socketDisconnection(socket.id);
    this.logger.log(`${socket.id} 소켓 연결 해제 ❌`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, message}: MessagePayload
  ) {
    socket.to(`${room_id}`).emit('message', {username: socket.id, message}); //front로 메세지 전송

    this.logger.log(`들어온 메세지: ${message}.`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, nickname}: JoinPayload
  ) {
    await this.chatService.joinRoom(room_id, nickname);
    socket.join(`${room_id}`);
    socket
      .to(`${room_id}`)
      .emit('message', {message: `${nickname}가 들어왔습니다.`});
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_id, nickname}: JoinPayload
  ) {
    await this.chatService.leaveRoom(room_id, nickname);
    socket.leave(`${room_id}`);
    socket
      .to(`${room_id}`)
      .emit('message', {message: `${nickname}가 나갔습니다.`});
  }

  // @SubscribeMessage('room-member')
}
