import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RecordRepository} from './record.repository';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordRepository)
    private recordRepository: RecordRepository
  ) {}

  async getEntireRecords(): Promise<string> {
    const records = await this.recordRepository.find();
    if (!records) {
      console.log('data not exists');
      throw new InternalServerErrorException(); // data not exists
    }
    return JSON.stringify(records);
  }

  async getOneRecords(user_id: string): Promise<string> {
    const win_records = await this.recordRepository.findOneBy({
      winner_id: user_id,
    });
    const lose_records = await this.recordRepository.findOneBy({
      loser_id: user_id,
    });
    if (!win_records && !lose_records) {
      console.log('data not exists');
      throw new InternalServerErrorException(); // data not exists
    }
    const mergedRecords = Object.assign(win_records, lose_records);
    return JSON.stringify(mergedRecords);
  }
}
