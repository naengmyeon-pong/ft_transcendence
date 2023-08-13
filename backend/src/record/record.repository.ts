import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Record} from './record.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class RecordRepository extends Repository<Record> {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>
  ) {
    super(
      recordRepository.target,
      recordRepository.manager,
      recordRepository.queryRunner
    );
  }
  async getRecentGames(userID: string, limit: number): Promise<Record[]> {
    return this.createQueryBuilder('record')
      .where('record.winner = :userID OR record.loser = :userID', {
        userID,
      })
      .orderBy('record.date', 'DESC')
      .take(limit)
      .getMany();
  }

  async getDetailGames(userID: string, pageSize: number, skip: number) {
    return this.createQueryBuilder('record')
      .leftJoinAndSelect('record.winner', 'winner') // Left join with winner
      .leftJoinAndSelect('record.loser', 'loser') // Left join with loser
      .where('record.winnerId = :userID OR record.loserId = :userID', {userID})
      .orderBy('record.id', 'DESC')
      .take(pageSize)
      .skip(skip)
      .getMany();
  }
}
