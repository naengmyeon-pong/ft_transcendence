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

  async getDetailGames(
    userID: string,
    typeID: number,
    pageSize: number,
    skip: number
  ) {
    return this.createQueryBuilder('record')
      .addSelect([
        'winner.user_id',
        'winner.user_nickname',
        // 'winner.user_image',
      ])
      .addSelect([
        'loser.user_id',
        'loser.user_nickname',
        // 'loser.user_image'
      ])
      .leftJoin('record.winner', 'winner')
      .leftJoin('record.loser', 'loser')
      .where(
        'record.gameTypeId = :typeID AND (record.winnerId = :userID OR record.loserId = :userID)',
        {userID, typeID}
      )
      .orderBy('record.id', 'DESC')
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();
  }
}
