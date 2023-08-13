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
import {SimpleRecordDto} from './dto/simple-record.dto';
import {DetailRecordDto} from './dto/detail-record.dto';
import {Record} from './record.entity';

@Controller('record')
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Get()
  async getEntireRecords(): Promise<string> {
    return await this.recordService.getEntireRecords();
  }

  @Get('simple')
  async getSimpleRecord(@Query('id') userID: string): Promise<SimpleRecordDto> {
    return await this.recordService.getSimpleRecord(userID);
  }

  @Get('detail')
  async getDetailRecord(
    @Query('id') userID: string,
    @Query('page') pageNo: number,
    @Query('size') pageSize: number
  ): Promise<Record[]> {
    let clientID = 'user1';
    return await this.recordService.getDetailRecord(
      clientID,
      userID,
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
