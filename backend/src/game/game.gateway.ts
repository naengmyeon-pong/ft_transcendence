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
import {number} from 'joi';
import {Namespace, Socket, Server} from 'socket.io';
import {User} from 'src/user/user.entitiy';

interface UserSocket {
  user_id: string;
  socket: Socket;
  keys: KeyData;
}

interface KeyData {
  up: boolean;
  down: boolean;
}

const waitUsers: UserSocket[] = [];
const gameRooms: Map<string, UserSocket[]> = new Map();

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('Gateway');

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.logger.log('게임 서버 초기화');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결`);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 게임 소켓 연결 해제`);
  }

  createGameRoom(userId: string, gameUserSockets: UserSocket[]): string {
    gameRooms.set(userId, gameUserSockets);
    return userId;
  }

  @SubscribeMessage('join_game')
  handleJoinGame(
    @ConnectedSocket() socket: Socket,
    @MessageBody() user_id: string
  ) {
    const keys: KeyData = {up: false, down: false};
    const userSocket: UserSocket = {user_id, socket, keys};
    if (waitUsers.length === 0) {
      // 게임 대기자가 없는 경우 => 대기열에 추가
      console.log('wait');
      waitUsers.push(userSocket);
    } else {
      // 게임 대기자가 있는 경우 => 대기중인 유저와 매칭
      console.log('join');
      const gameUserSockets: UserSocket[] = [];
      const firstUser = waitUsers.shift();
      const secondUser = userSocket;
      const roomName = this.createGameRoom(firstUser.user_id, gameUserSockets);

      gameUserSockets.push(firstUser);
      gameUserSockets.push(secondUser);
      gameRooms.set(roomName, gameUserSockets);

      firstUser.socket.join(roomName);
      secondUser.socket.join(roomName);
      secondUser.socket
        .to(roomName)
        .emit('notice', {notice: `${user_id}이 입장했습니다.`});
      this.nsp.to(roomName).emit('room_name', {room_name: roomName});
    }
  }

  @SubscribeMessage('key_down')
  handleKeyDown(
    @ConnectedSocket() socket: Socket,
    @MessageBody() {room_name, key}: {room_name: string; key: string}
  ) {
    console.log('here');
    console.log(room_name, key);
  }
}
