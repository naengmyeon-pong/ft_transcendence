import {Controller, Get, Param} from '@nestjs/common';
import {RecordService} from './record.service';

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
}
