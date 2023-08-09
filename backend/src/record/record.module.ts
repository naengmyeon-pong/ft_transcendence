import {Module} from '@nestjs/common';
import {RecordController} from './record.controller';
import {RecordService} from './record.service';
import {ModeModule} from './mode/mode.module';
import {TypeController} from './type/type.controller';
import {TypeService} from './type/type.service';
import {TypeModule} from './type/type.module';
import {RecordRepository} from './record.repository';
import {UserRepository} from 'src/user/user.repository';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Record} from './record.entity';
import {User} from 'src/user/user.entitiy';

@Module({
  imports: [
    ModeModule,
    TypeModule,
    TypeOrmModule.forFeature([Record]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository, UserRepository],
})
export class RecordModule {}
