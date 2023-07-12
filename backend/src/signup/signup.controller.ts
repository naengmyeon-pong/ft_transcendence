import { Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Get()
  // @Redirect(`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.INTRA_API_UID}&redirect_uri=${process.env.INTRA_API_URI}&response_type=code`);
  // @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3d94fb385e79fd3ae1927dc2023fb428b19b190eeb581049231ea9dd301e17fa&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fsignup%2F42api%2Foauth_ok&response_type=code')
  @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3d94fb385e79fd3ae1927dc2023fb428b19b190eeb581049231ea9dd301e17fa&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fsignup%2F42api%2Foauth_ok&response_type=code')
  api() {}
  
  @Get('/42api/oauth_ok')
  getUserData(@Query('code') code: string): Promise<string> {
    const token = this.signupService.getAccessToken(code);
    return this.signupService.getUserData(token);
    // return this.signupService.getUserData(this.signupService.getAccessToken(code));
  }

}
