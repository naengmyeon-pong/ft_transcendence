import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {SignupService} from './signup.service';
import {UserDto} from 'src/user/dto/user.dto';
import {UserService} from 'src/user/user.service';
@Controller('signup')
export class SignupController {
  constructor(
    private signupService: SignupService,
    private userService: UserService
  ) {}

  @Get('/auth')
  async getUserData(@Query('code') code: string): Promise<string> {
    return await this.signupService.getUserData(code);
  }

  // nickname이 없으면 true, 있으면 false
  @Get('/nickname')
  async checkUserNickname(
    @Query('user_id') user_id: string,
    @Query('nickname') nickname: string
  ): Promise<boolean> {
    return await this.signupService.checkUserNickname(user_id, nickname);
  }

  @Post()
  async signup(@Body(ValidationPipe) userinfo: UserDto): Promise<void> {
    return await this.userService.create(userinfo);
  }
}
