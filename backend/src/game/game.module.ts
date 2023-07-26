import {Module} from '@nestjs/common';
import {GameGateway} from './game.gateway';
import {RecordRepository} from 'src/record/record.repository';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {Record} from 'src/record/record.entity';
import {UserRepository} from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Record]),
  ],
  providers: [GameGateway, RecordRepository, UserRepository],
})
export class GameModule {}
