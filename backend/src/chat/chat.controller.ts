import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {ChatService} from './chat.service';
import {RoomDto} from './dto/room.dto';

@Controller('chatroom')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('room_list') // http://localhost:3001/chatroom/room_list
  async getRoomList() {
    return await this.chatService.getRoomList();
  }

  @Get('room_members') // http://localhost:3001/chatroom/room_members
  async getRoomMembers(@Query('room_id') room_id: number) {
    return await this.chatService.getRoomMembers(room_id);
  }

  @Post('create_room') //http://localhost:3001/chatroom/create_room
  async createRoom(@Body() roomDto: RoomDto) {
    return await this.chatService.createRoom(roomDto);
  }
}
