import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {Queue} from 'bull';

@Injectable()
export class GameService {
  constructor(@InjectQueue('game') private GameQueue: Queue) {}

  async putUserOnQueue(data: any): Promise<void> {
    // Add a job to the 'example' queue
    await this.GameQueue.add(data);
  }
}
