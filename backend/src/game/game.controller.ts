import {Controller, Get, Query} from '@nestjs/common';

@Controller('game')
export class GameController {
  @Get()
  putUserOnQueue(@Query('type') type: string, @Query('mode') mode: string) {
    // console.log('type:', type);
    // console.log('mode:', mode);
    this.putUserOnQueue(type, mode);
  }
}
