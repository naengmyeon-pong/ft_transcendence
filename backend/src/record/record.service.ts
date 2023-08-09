import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RecordRepository} from './record.repository';
import {UserRepository} from 'src/user/user.repository';
import {Record} from './record.entity';
import {RecentRecord} from '@/types/record';
import {SimpleRecordDto} from './dto/simple-record.dto';

@Injectable()
export class RecordService {
  constructor(
    // @InjectRepository(RecordRepository)
    private recordRepository: RecordRepository,
    private userRepository: UserRepository
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

  getSimpleRecord = async (userID: string): Promise<SimpleRecordDto> => {
    const user = await this.userRepository.findOneBy({user_id: userID});
    const win: number = await this.recordRepository.count({
      where: {
        winner_id: userID,
      },
    });
    const lose: number = await this.recordRepository.count({
      where: {
        loser_id: userID,
      },
    });
    const forfeit: number = await this.recordRepository.count({
      where: {
        loser_id: userID,
        is_forfeit: true,
      },
    });
    const {rank_score} = user;
    let recentCount = 5;
    if (win + lose < 5) {
      recentCount = win + lose;
    }
    const recentRecord = await this.getRecentGames(userID, recentCount);
    const simpleRecordDto: SimpleRecordDto = {
      win,
      lose,
      rank_score,
      forfeit,
      recent_record: await recentRecord,
    };
    return simpleRecordDto;
  };

  getRecentGames = async (
    userID: string,
    limit: number
  ): Promise<RecentRecord> => {
    const recentGames: Record[] = await this.recordRepository.getRecentGames(
      userID,
      limit
    );
    const recentRecord: RecentRecord = {
      0: -1,
      1: -1,
      2: -1,
      3: -1,
      4: -1,
    };

    recentGames.forEach((record, idx) => {
      const {winner_id} = record;
      if (winner_id === userID) {
        recentRecord[idx] = 0;
      } else {
        recentRecord[idx] = 1;
      }
    });
    return recentRecord;
  };
}
