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

  // @Get('/:user_id')
  // async getOneRecords(@Param('user_id') user_id: string): Promise<string> {
  //   console.log('/:user_id');
  //   return await this.recordService.getOneRecords(user_id);
  // }

  @Get('/simple')
  async getSimpleRecord(@Query('id') userID: string): Promise<SimpleRecordDto> {
    // Validate query parameters
    if (!userID || typeof userID !== 'string') {
      throw new BadRequestException('Invalid query parameters');
    }
    return await this.recordService.getSimpleRecord(userID);
  }

  @Get('/detail')
  async getDetailRecord(
    @Query('id') userID: string,
    @Query('page') pageNo: number,
    @Query('size') pageSize: number
  ): Promise<Record[]> {
    // Validate query parameters
    if (!userID || typeof userID !== 'string' || isNaN(pageNo)) {
      throw new BadRequestException('Invalid query parameters');
    }
    let clientID = 'user1';
    return await this.recordService.getDetailRecord(
      clientID,
      userID,
      pageNo,
      pageSize
    );
  }

  @Post('/test')
  async PostTest(
    @Query('winner') winner: string,
    @Query('loser') loser: string
  ) {
    this.recordService.PostTest(winner, loser);
    console.log('winner: ', winner, '\nloser: ', loser);
  }
}
