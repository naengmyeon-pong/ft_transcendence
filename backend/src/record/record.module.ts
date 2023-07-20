import {Module} from '@nestjs/common';
import {RecordController} from './record.controller';
import {RecordService} from './record.service';
import {ModeModule} from './mode/mode.module';
import {TypeController} from './type/type.controller';
import {TypeService} from './type/type.service';
import {TypeModule} from './type/type.module';

@Module({
  controllers: [RecordController, TypeController],
  providers: [RecordService, TypeService],
  imports: [ModeModule, TypeModule],
})
export class RecordModule {}
