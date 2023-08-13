import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RecordRepository} from './record.repository';
import {UserRepository} from 'src/user/user.repository';
import {Record} from './record.entity';
import {SimpleRecordDto} from './dto/simple-record.dto';
import {DetailRecordDto} from './dto/detail-record.dto';

// export interface PageID {
//   page: number;
//   id: number;
// }

// export const userPageID: Map<string, PageID> = new Map();

@Injectable()
export class RecordService {
  constructor(
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

  getSimpleRecord = async (userID: string): Promise<SimpleRecordDto> => {
    if (!userID || typeof userID !== 'string') {
      throw new BadRequestException('Invalid request format');
    }
    const user = await this.userRepository.findOneBy({user_id: userID});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // let win = 0,
    //   lose = 0;
    // if (user.win_records) {
    //   win = user.win_records.length;
    // }
    // if (user.lose_records) {
    //   lose = user.lose_records.length;
    // }
    const win = await this.recordRepository.count({
      where: {
        winnerId: userID,
      },
    });
    const lose = await this.recordRepository.count({
      where: {
        loserId: userID,
      },
    });
    const forfeit: number = await this.recordRepository.count({
      where: {
        loserId: userID,
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
      recent_record: recentRecord,
    };
    return simpleRecordDto;
  };

  getRecentGames = async (userID: string, limit: number): Promise<string[]> => {
    console.log('limit: ', limit);
    const recentGames: Record[] = await this.recordRepository.getRecentGames(
      userID,
      limit
    );
    const recentRecord: string[] = [];
    recentGames.forEach(record => {
      const {winnerId} = record;
      if (winnerId === userID) {
        recentRecord.push('승');
      } else {
        recentRecord.push('패');
      }
    });
    return recentRecord;
  };

  getDetailRecord = async (
    clientID: string,
    userID: string,
    pageNo: number,
    pageSize: number
  ): Promise<Record[]> => {
    if (!userID || typeof userID !== 'string' || isNaN(pageNo)) {
      throw new BadRequestException('Invalid request format');
    }
    const user = await this.userRepository.findOneBy({user_id: userID});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const skip = (pageNo - 1) * pageSize;
    return await this.recordRepository.getDetailGames(userID, pageSize, skip);
  };

  getSave(winner: string, loser: string) {
    const record = this.recordRepository.create({
      winnerId: winner,
      loserId: loser,
      winner_score: 5,
      loser_score: 0,
      is_forfeit: false,
      game_mode: 1,
      game_type: 1,
    });
    this.recordRepository.save(record);
  }
  async getJoinTest(user: string) {
    const record = await this.userRepository.findOneBy({
      user_id: user,
    });
    console.log(record);
    return record;
  }
}
