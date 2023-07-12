import { Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Get()
  @Redirect(`${process.env.INTRA_AUTH_URI}?client_id=${process.env.INTRA_API_UID}&redirect_uri=${process.env.INTRA_API_REDIRECT_URI}&response_type=code`)
  api() {}
  
  @Get('/42api/oauth_ok')
  getUserData(@Query('code') code: string): Promise<string> {
    return this.signupService.getUserData(code);
  }

}
