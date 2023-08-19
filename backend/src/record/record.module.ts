import {Module} from '@nestjs/common';
import {RecordController} from './record.controller';
import {RecordService} from './record.service';
import {ModeModule} from './mode/mode.module';
import {TypeModule} from './type/type.module';
import {RecordRepository} from './record.repository';
import {UserRepository} from 'src/user/user.repository';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Record} from './record.entity';
import {User} from 'src/user/user.entitiy';
import {TypeRepository} from './type/type.repository';
import {Type} from './type/type.entity';

@Module({
  imports: [
    ModeModule,
    TypeModule,
    TypeOrmModule.forFeature([Record]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Type]),
  ],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository, UserRepository, TypeRepository],
})
export class RecordModule {}
