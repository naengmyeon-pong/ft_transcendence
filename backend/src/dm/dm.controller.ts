import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {DmService} from './dm.service';
import {ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {AuthGuard} from '@nestjs/passport';

@Controller('dm')
@UseGuards(AuthGuard('jwt'))
export class DmController {
  constructor(private dmService: DmService) {}

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
  @ApiQuery({
    name: 'user_id',
    required: true,
    description: '현재 유저의 id',
  })
  @ApiQuery({
    name: 'other_id',
    required: true,
    description: 'dm상대방의 id',
  })
  @Get()
  async getDirectMessage(
    @Query('user_id') user_id: string,
    @Query('other_id') other_id: string
  ) {
    const dm = await this.dmService.getDirectMessage(user_id, other_id);
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
  @ApiQuery({
    name: 'user_id',
    required: true,
    description: '현재 유저의 id',
  })
  @Get('dm_list')
  async getDMList(@Query('user_id') user_id: string) {
    return await this.dmService.directMessageList(user_id);
  }
}
