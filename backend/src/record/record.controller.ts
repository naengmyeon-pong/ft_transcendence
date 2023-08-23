import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {RecordService} from './record.service';
import {RecordSummaryDto} from './dto/record-summary.dto';
import {DetailRecordDto} from './dto/detail-record.dto';
import {Record} from './record.entity';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';

@Controller('record')
@ApiTags('Record')
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Get()
  @ApiOperation({
    summary: '(테스트용) 전체 전적 요청 API',
    description: 'DB에 저장된 모든 전적을 반환함.',
  })
  async getEntireRecords(): Promise<string> {
    return await this.recordService.getEntireRecords();
  }

  @Get('simple')
  @ApiOperation({
    summary: '특정 유저 게임 통계 요청 API',
    description: 'DB를 조회하여 해당 유저의 게임 통계를 반환함.',
  })
  @ApiQuery({
    name: 'id',
    required: true,
    description: '조회할 유저의 ID',
  })
  @ApiResponse({
    status: 200,
    description: '정상적으로 게임 통계를 반환하는 경우',
  })
  @ApiResponse({
    status: 400,
    description: 'URL을 통해 쿼리가 정상적으로 전달되지 않은 경우',
  })
  @ApiResponse({
    status: 404,
    description: '사용자가 존재하지 않는 경우',
  })
  async getRecordSummary(
    @Query('id') userID: string
  ): Promise<RecordSummaryDto> {
    return await this.recordService.getRecordSummary(userID);
  }

  @Get('detail')
  @ApiOperation({
    summary: '특정 유저 전적 요청 API',
    description:
      'DB를 조회하여 해당 유저의 전적을 페이지네이션 옵션에 맞게 반환함.',
  })
  @ApiQuery({
    name: 'id',
    required: true,
    description: '조회할 유저의 ID',
  })
  @ApiQuery({
    name: 'page',
    required: true,
    description: '요청하는 페이지 번호',
  })
  @ApiQuery({
    name: 'size',
    required: true,
    description: '한 요청당 반환받을 전적의 개수',
  })
  @ApiResponse({
    status: 200,
    description: '정상적으로 전적을 반환하는 경우',
  })
  @ApiResponse({
    status: 400,
    description: 'URL을 통해 쿼리가 정상적으로 전달되지 않은 경우',
  })
  @ApiResponse({
    status: 404,
    description: '사용자가 존재하지 않는 경우',
  })
  async getDetailRecord(
    @Query('id') userID: string,
    @Query('type') type: string,
    @Query('page') pageNo: number,
    @Query('size') pageSize: number
  ): Promise<{
    records: Record[];
    pageNo: number;
    totalPage: number;
    count: number;
  }> {
    return await this.recordService.getDetailRecord(
      userID,
      type,
      pageNo,
      pageSize
    );
  }

  // For Test
  @Get('save')
  async getSave(
    @Query('winner') winner: string,
    @Query('loser') loser: string
  ) {
    this.recordService.getSave(winner, loser);
    console.log('winner: ', winner, '\nloser: ', loser);
  }

  // For Test
  @Get('join-test')
  async getJoinTest(@Query('user') user: string) {
    return await this.recordService.getJoinTest(user);
  }
}
