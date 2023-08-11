import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {ChatService} from './chat.service';
import {RoomDto} from './dto/room.dto';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';

@Controller('chatroom')
@ApiTags('Chat Room')
export class ChatController {
  constructor(private chatService: ChatService) {}

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
  @Get('room_list')
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
  @Get('room_members')
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
  @Post('create_room')
  async createRoom(@Body() roomDto: RoomDto) {
    return await this.chatService.createRoom(roomDto);
  }

  @ApiOperation({
    summary: '채팅방 존재 여부 확인 API',
    description: `채팅방에 입장하기 전에, 해당 채팅방이 존재하는지 확인한다.
    채팅방 목록이 자동으로 새로고침 되는 것이 아니기 때문에 입장 전에 확인이 필요하다.`,
  })
  @ApiResponse({
    status: 200,
    description: '채팅방이 존재하는 경우',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방이 존재하지 않는 경우',
  })
  @Get('join_room')
  async getRoom(@Query('room_id') room_id: number) {
    return await this.chatService.getRoom(room_id);
  }

  @ApiOperation({
    summary: '접속중인 유저 목록 조회 API',
    description: '현재 로그인 한 유저들의 목록을 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 유저 목록을 잘 가져온 경우',
  })
  @Get('users')
  getLoginUsers() {
    const member = this.chatService.getLoginUsers();
    return member;
  }

  // 함수 이름 변경 필요함.
  @ApiOperation({
    summary: '채팅방 초대를 위한 유저 검색 API',
    description: `채팅방에 유저를 초대하기 위해 검색합니다.
    현재 접속중인 유저 중, 다른 채팅방에 접속중이지 않고 차단목록에 존재하지 않는 유저 목록을 가져옵니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '주어진 닉네임과 비슷한 유저 목록을 잘 가져온 경우',
  })
  @ApiResponse({
    status: 400,
    description: '검색에 필요한 닉네임이 비어있는 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
  @Get('user/:user_nickname/:user_id')
  async getLoginUser(
    @Param('user_nickname') user_nickname: string,
    @Param('user_id') user_id: string
  ) {
    const member = await this.chatService.getLoginUser(user_nickname, user_id);
    return member;
  }

  @ApiOperation({
    summary: '저장되어있는 dm을 불러오는 API',
    description: '특정 유저와의 dm데이터를 불러옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'dm데이터를 정상적으로 불러온 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
  @Get('dm')
  async getDirectMessage(
    @Query('user_id') user_id: string,
    @Query('other_id') other_id: string
  ) {
    const dm = await this.chatService.getDirectMessage(user_id, other_id);
    return dm;
  }

  @ApiOperation({
    summary: 'dm 목록을 불러오는 API',
    description: '해당 유저가 dm을 보냈던 유저들의 목록을 불러옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'dm목록을 정상적으로 불러온 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
  @Get('dm_list')
  async getDMList(@Query('user_id') user_id: string) {
    return await this.chatService.directMessageList(user_id);
  }

  @ApiOperation({
    summary: '차단 유저 목록을 불러오는 API',
    description: '차단한 유저의 목록을 불러옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'dm데이터를 정상적으로 불러온 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
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

  @Post('update_chatroom_pw')
  async updateChatRoomPw(
    @Body('room_id') room_id: number,
    @Body('password') password?: number
  ) {
    return await this.chatService.updateChatRoomPw(room_id, password);
  }

  // http://localhost:3001/chatroom/search_user?user_id=tester1&user_nickname=nick =>이런식으로 사용
  // 자기 자신의 user_id도 같이 받아서, 자기 자신을 제외한 유저만 검색해서 반환하도록 했음.
  @Get('search_user')
  async searchUser(
    @Query('user_id') user_id: string,
    @Query('user_nickname') user_nickname: string
  ) {
    return await this.chatService.searchUser(user_id, user_nickname);
  }

  @Get('friend_list')
  async getFriendList(@Query('user_id') user_id: string) {
    return await this.chatService.getFriendList(user_id);
  }
}
