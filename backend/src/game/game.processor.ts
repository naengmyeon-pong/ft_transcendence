import {Process, Processor} from '@nestjs/bull';

@Processor('normal_game')
export class NormalGameProcessor {
  @Process()
  async processJob(job: any) {
    // Process the job asynchronously
    // This function will be executed when a job is added to the 'example' queue
    console.log('Processing job:', job.data);
    // Perform your time-consuming task here
  }
}

@Processor('rank_game')
export class RankGameProcessor {
  @Process()
  async processJob(job: any) {
    console.log('Processing job:', job.data);
  }
}
