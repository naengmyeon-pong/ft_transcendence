import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {RecordRepository} from './record.repository';
import {UserRepository} from 'src/user/user.repository';
import {Record} from './record.entity';
import {RecentRecord} from '@/types/record';
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

  // async getOneRecords(user_id: string): Promise<string> {
  //   const win_records = await this.recordRepository.findOneBy({
  //     winner_id: user_id,
  //   });
  //   const lose_records = await this.recordRepository.findOneBy({
  //     loser_id: user_id,
  //   });
  //   if (!win_records && !lose_records) {
  //     console.log('data not exists');
  //     throw new InternalServerErrorException(); // data not exists
  //   }
  //   const mergedRecords = Object.assign(win_records, lose_records);
  //   return JSON.stringify(mergedRecords);
  // }

  getSimpleRecord = async (userID: string): Promise<SimpleRecordDto> => {
    const user = await this.userRepository.findOneBy({user_id: userID});
    const win: number = await this.recordRepository.count({
      where: {
        winner: userID,
      },
    });
    const lose: number = await this.recordRepository.count({
      where: {
        loser: userID,
      },
    });
    const forfeit: number = await this.recordRepository.count({
      where: {
        loser: userID,
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
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
    };

    recentGames.forEach((record, idx) => {
      const {winner} = record;
      if (winner === userID) {
        recentRecord[idx] = '승';
      } else {
        recentRecord[idx] = '패';
      }
    });
    return recentRecord;
  };

  getDetailRecord = async (
    clientID: string,
    userID: string,
    pageNo: number,
    pageSize: number
  ): Promise<Record[] | null> => {
    // this.recordRepository.findAndCount({
    //   relations: [''],
    //   select: ['id', 'winner_id', 'winner_score']
    // })
    // const win: number = await this.recordRepository.count({
    //   where: {
    //     winner_id: userID,
    //   },
    // });
    // const lose: number = await this.recordRepository.count({
    //   where: {
    //     loser_id: userID,
    //   },
    // });
    const skip = (pageNo - 1) * pageSize;
    // const record = await this.recordRepository.
    const result = await this.recordRepository.find({
      // relations: {
      //   winner: true,
      // },
      where: [{winner: userID}, {loser: userID}],
      order: {id: 'DESC'},
      take: pageSize,
      skip: skip,
    });
    // result.forEach((value) => {
    //   await this.userRepository.findOneBy(value.winner)
    // });

    return result;
  };

  PostTest(winner: string, loser: string) {
    const record = this.recordRepository.create({
      winner,
      loser,
      winner_score: 5,
      loser_score: 5,
      is_forfeit: false,
      game_mode: 1,
      game_type: 1,
    });
    this.recordRepository.save(record);
  }
}
