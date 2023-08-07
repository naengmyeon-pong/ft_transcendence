import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {TwoFactorAuthService} from './two-factor-auth.service';
import {AuthGuard} from '@nestjs/passport';
import {UserDto} from 'src/user/dto/user.dto';
import {Response} from 'express';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate')
  // @UseGuards(AuthGuard('signup'))
  async register(@Res() res: Response, @Req() req: UserDto) {
    const {otpAuthUrl} =
      await this.twoFactorAuthService.generateTwoFactorAuthSecret(req);
    return await this.twoFactorAuthService.pipeQRCodeStream(res, otpAuthUrl);
  }
}
