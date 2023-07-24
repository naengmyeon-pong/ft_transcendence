import {Logger} from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {Server} from 'socket.io';

@WebSocketGateway(8080, {transports: ['websocket']})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  logger = new Logger();

  @SubscribeMessage('ClientToServer')
  async handleMessage(@MessageBody() data) {
    this.logger.log(data);
    this.server.emit('ServerToClient', data);
    return data;
  }

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }
}
