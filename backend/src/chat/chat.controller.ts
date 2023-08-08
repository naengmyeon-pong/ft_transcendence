import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { RoomDto } from './dto/room.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('chatroom')
@ApiTags('Chat Room')
export class ChatController {
  constructor(private chatService: ChatService) { }

  @ApiOperation({
    summary: '채팅방 목록 조회 API',
    description:
      '채팅방 목록을 보여주기 위해서 db에 저장된 채팅방을 객체배열로 전달한다.',
  })
  @ApiResponse({
    status: 200,
    description: `정상적으로 채팅방 목록을 받아온 경우
    다른 status code는 없고, 없으면 빈 배열을 반환한다.`,
  })
  @Get('room_list') // http://localhost:3001/chatroom/room_list
  async getRoomList() {
    return await this.chatService.getRoomList();
  }

  @ApiOperation({
    summary: '채팅방 멤버 조회 API',
    description: '채팅방에 포함된 유저 목록을 객체배열로 전달한다.',
  })
  @ApiQuery({
    name: 'room_id',
    required: true,
    description: '채팅방 유저 목록을 얻어오기 위한 API',
  })
  @ApiResponse({
    status: 200,
    description: `정상적으로 채팅방 유저 목록을 받아온 경우
    다른 status는 없고, 잘못된 방에 접근하면 빈 객체가 반환될 것이다.`,
  })
  @Get('room_members') // http://localhost:3001/chatroom/room_members
  async getRoomMembers(@Query('room_id') room_id: number) {
    return await this.chatService.getRoomMembers(room_id);
  }

  @ApiOperation({
    summary: '채팅방 생성 API',
    description: '채팅방을 새로 생성한다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방이 정상적으로 생성된 경우',
  })
  @ApiResponse({
    status: 201,
    description: '채팅방이 정상적으로 생성된 경우',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방을 생성하는 유저가 존재하지 않을경우',
  })
  @ApiResponse({
    status: 409,
    description: '채팅방을 생성하는 유저가 이미 다른 채팅방의 owner인 경우',
  })
  @Post('create_room') //http://localhost:3001/chatroom/create_room
  async createRoom(@Body() roomDto: RoomDto) {
    return await this.chatService.createRoom(roomDto);
  }

  @Get('join_room') //http://localhost:3001/chatroom/join_room?room_id=id
  async getRoom(@Query('room_id') room_id: number) {
    return await this.chatService.getRoom(room_id);
  }

  @Get('users')
  getLoginUsers() {
    const member = this.chatService.getLoginUsers();
    return member;
  }

  @Get('user/:user_nickname')
  async getLoginUser(@Param('user_nickname') user_nickname: string) {
    const member = await this.chatService.getLoginUser(user_nickname);
    return member;
  }

  @Get('dm')
  async getDirectMessage(
    @Query('user_id') user_id: string,
    @Query('other_id') other_id: string
  ) {
    const dm = await this.chatService.getDirectMessage(user_id, other_id);
    return dm;
  }

  @Get('dm_list')
  async getDMList(@Query('user_id') user_id: string) {
    return await this.chatService.directMessageList(user_id);
  }

  @Get('block_list/:user_id')
  async getBlockList(@Param('user_id') user_id: string) {
    return await this.chatService.getBlockList(user_id);
  }

  // if no chat room, 404 error
  // return true, false
  @Post('chatroom_pw')
  async checkChatRoomPw(
    @Body('room_id') room_id: number,
    @Body('password') password: number
  ): Promise<boolean> {
    return await this.chatService.checkChatRoomPw(room_id, password);
  }

  // http://localhost:3001/chatroom/search_user?user_id=tester1&user_nickname=nick =>이런식으로 사용
  // 자기 자신의 user_id도 같이 받아서, 자기 자신을 제외한 유저만 검색해서 반환하도록 했음.
  @Get('search_user')
  async searchUser(
    @Query('user_id') user_id: string,
    @Query('user_nickname') user_nickname: string) {
    return await this.chatService.searchUser(user_id, user_nickname);
  }

  @Get('friend_list')
  async getFriendList(
    @Query('user_id') user_id: string
  ) {
    return await this.chatService.getFriendList(user_id);
  }
}
