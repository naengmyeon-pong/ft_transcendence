import {Controller, Get, Param} from '@nestjs/common';
import {RecordService} from './record.service';
import {SimpleRecordDto} from './dto/simple-record.dto';

@Controller('record')
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Get()
  async getEntireRecords(): Promise<string> {
    return await this.recordService.getEntireRecords();
  }

  @Get('/:user_id')
  async getOneRecords(@Param('user_id') user_id: string): Promise<string> {
    return await this.recordService.getOneRecords(user_id);
  }

  @Get('simple/:user_id')
  async getSimpleRecord(
    @Param('user_id') user_id: string
  ): Promise<SimpleRecordDto> {
    return await this.recordService.getSimpleRecord(user_id);
  }
}
