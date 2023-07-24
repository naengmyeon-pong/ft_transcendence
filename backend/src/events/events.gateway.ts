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
import {Namespace, Socket} from 'socket.io';

interface MessagePayload {
  roomName: string;
  message: string;
}

let createdRooms: string[] = ['test_room'];

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('Gateway');

  @WebSocketServer() nsp: Namespace;

  afterInit() {
    this.nsp.adapter.on('delete-room', room => {
      const deletedRoom = createdRooms.find(
        createdRoom => createdRoom === room
      );
      if (!deletedRoom) return;

      this.nsp.emit('delete-room', deletedRoom);
      createdRooms = createdRooms.filter(
        createdRoom => createdRoom !== deletedRoom
      ); // 유저가 생성한 room 목록 중에 삭제되는 room 있으면 제거
    });

    this.logger.log('웹소켓 서버 초기화 ✅');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓 연결 해제 ❌`);
  }

  @SubscribeMessage('message') //메세지 전송하면 이쪽으로 들어옴
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {roomName, message}: MessagePayload
  ) {
    socket.to(roomName).emit('message', {username: socket.id, message}); //상대방에게 전송되는 내용.

    this.logger.log(`들어온 메세지: ${message}`);
    return {username: socket.id, message}; //자신채팅에 적용되는 내용.
  }

  @SubscribeMessage('room-list')
  handleRoomList() {
    return createdRooms;
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string
  ) {
    const exists = createdRooms.find(createdRoom => createdRoom === roomName);
    if (exists) {
      return {success: false, payload: `${roomName} 방이 이미 존재합니다.`};
    }

    socket.join(roomName); // 기존에 없던 room으로 join하면 room이 생성됨
    createdRooms.push(roomName); // 유저가 생성한 room 목록에 추가
    this.nsp.emit('create-room', roomName); // 대기실 방 생성

    return {success: true, payload: roomName};
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string
  ) {
    socket.join(roomName); // join room
    socket
      .to(roomName)
      .emit('message', {message: `${socket.id}가 들어왔습니다.`}); // 채팅에 참여했을 때 뜨는 내용.

    return {success: true};
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomName: string
  ) {
    socket.leave(roomName); // leave room
    socket
      .to(roomName)
      .emit('message', {message: `${socket.id}가 나갔습니다.`});

    return {success: true};
  }
}
