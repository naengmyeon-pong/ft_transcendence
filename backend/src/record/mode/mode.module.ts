import {Module} from '@nestjs/common';
import {ModeService} from './mode.service';
import {ModeController} from './mode.controller';

@Module({
  providers: [ModeService],
  controllers: [ModeController],
})
export class ModeModule {}
