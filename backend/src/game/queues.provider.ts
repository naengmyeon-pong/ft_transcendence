import {BullModule} from '@nestjs/bull';
import {Module} from '@nestjs/common';
import {NormalGameProcessor, RankGameProcessor} from './game.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [NormalGameProcessor, RankGameProcessor],
})
export class QueuesProviderModule {}
