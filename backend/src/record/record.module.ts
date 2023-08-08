import {Module} from '@nestjs/common';
import {RecordController} from './record.controller';
import {RecordService} from './record.service';
import {ModeModule} from './mode/mode.module';
import {TypeController} from './type/type.controller';
import {TypeService} from './type/type.service';
import {TypeModule} from './type/type.module';
import {UserRepository} from 'src/user/user.repository';

@Module({
  controllers: [RecordController, TypeController],
  providers: [RecordService, TypeService, UserRepository],
  imports: [ModeModule, TypeModule],
})
export class RecordModule {}
