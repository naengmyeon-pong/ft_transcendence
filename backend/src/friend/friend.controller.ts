import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {FriendService} from './friend.service';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';

@Controller('friend')
@ApiTags('Friend')
@UseGuards(AuthGuard('jwt'))
export class FriendController {
  constructor(private friendService: FriendService) {}

  @ApiOperation({
    summary: '친구목록을 불러오는 API',
    description: '현재 유저가 추가한 친구목록을 불러옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: `친구목록을 정상적으로 불러온 경우`,
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
  @Get('friend_list')
  async getFriendList(@Query('user_id') user_id: string) {
    return await this.friendService.getFriendList(user_id);
  }
}
