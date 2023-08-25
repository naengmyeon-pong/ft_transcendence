import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {ChatService} from './chat.service';
import {RoomDto} from './dto/room.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';
import {PartialRoomDto} from './dto/partial-room.dto';
import {UserDto} from '@/user/dto/user.dto';

@Controller('chatroom')
@UseGuards(AuthGuard('jwt'))
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
  @ApiQuery({
    name: 'room_id',
    required: true,
    description: '채팅방의 id',
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
  @ApiQuery({
    name: 'room_id',
    required: true,
    description: '채팅방의 id',
  })
  @Get('isRoom')
  async isRoom(@Query('room_id') room_id: number) {
    return await this.chatService.getRoom(room_id);
  }

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
  @ApiParam({
    name: 'user_nickname',
    required: true,
    description: '검색할 유저의 닉네임',
  })
  @ApiParam({
    name: 'user_id',
    required: true,
    description: '검색하는 유저의 id',
  })
  @Get('user/:user_nickname/:user_id')
  async inviteChatRoom(
    @Param('user_nickname') user_nickname: string,
    @Param('user_id') user_id: string
  ) {
    const member = await this.chatService.inviteChatRoom(
      user_nickname,
      user_id
    );
    return member;
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
  @ApiParam({
    name: 'user_id',
    required: true,
    description: '현재 유저의 id',
  })
  @Get('block_list/:user_id')
  async getBlockList(@Param('user_id') user_id: string) {
    return await this.chatService.getBlockList(user_id);
  }

  @ApiOperation({
    summary: '채팅방 pw를 확인하는 API',
    description:
      '채팅방에 비밀번호가 걸려있는 경우, 유저가 입력한 비밀번호와 비교합니다.',
  })
  @ApiResponse({
    status: 200,
    description: `
      채팅방 db를 잘 조회한 경우.
      입력한 비밀번호가 맞는지는 true, false로 반환합니다.
    `,
  })
  @ApiResponse({
    status: 404,
    description: 'room_id로 해당 채팅방을 찾을 수 없는경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
  @ApiProperty({
    name: 'room_id',
    example: 1,
    description: '채팅방 id',
    required: true,
  })
  @ApiBody({
    schema: {
      properties: {
        room_id: {type: 'number'},
        password: {type: 'number'},
      },
    },
  })
  @Post('chatroom_pw')
  async checkChatRoomPw(
    @Body('room_id') room_id: number,
    @Body(ValidationPipe) userDto: PartialRoomDto
  ): Promise<boolean> {
    return await this.chatService.checkChatRoomPw(room_id, userDto);
  }

  @ApiOperation({
    summary: '채팅방 pw를 변경하는 API',
    description: '채팅방 주인이 비밀번호를 수정할 때, 수정할 pw로 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: `채팅방 pw를 정상적으로 수정한 경우.`,
  })
  @ApiResponse({
    status: 404,
    description: 'room_id로 해당 채팅방을 찾을 수 없는경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
  @ApiBody({
    schema: {
      properties: {
        room_id: {type: 'number'},
        password: {type: 'number'},
      },
    },
  })
  @Post('update_chatroom_pw')
  async updateChatRoomPw(
    @Body('room_id') room_id: number,
    @Body(ValidationPipe) UserDto?: PartialRoomDto
  ) {
    return await this.chatService.updateChatRoomPw(room_id, UserDto);
  }

  @ApiOperation({
    summary: '유저를 검색하는 API',
    description: `메인페이지에서 유저를 검색할 경우,
    자기자신과 이미 친구목록에 있는 유저 그리고 차단목록에 있는 유저를 제외하고 입력한 닉네임과 유사한 모든 유저를 불러옵니다.`,
  })
  @ApiResponse({
    status: 200,
    description: `유저 검색에 성공한 경우`,
  })
  @ApiResponse({
    status: 400,
    description: 'parameter에 닉네임이 없는 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'db 조회에 오류가 발생한 경우',
  })
  @ApiQuery({
    name: 'user_id',
    required: true,
    description: '검색하는 현재유저의 id',
  })
  @ApiQuery({
    name: 'user_nickname',
    required: true,
    description: '검색할 닉네임',
  })
  @Get('search_user')
  async searchUser(
    @Query('user_id') user_id: string,
    @Query('user_nickname') user_nickname: string
  ) {
    return await this.chatService.searchUser(user_id, user_nickname);
  }
}
