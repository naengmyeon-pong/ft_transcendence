import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  InternalServerErrorException,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {TwoFactorAuthService} from './two-factor-auth.service';
import {AuthGuard} from '@nestjs/passport';
import {UserDto} from 'src/user/dto/user.dto';
import {Response} from 'express';
import {TwoFactorAuthCodeDto} from './dto/two-factor-auth-code.dto';
import {JwtService} from '@nestjs/jwt';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService // private jwtService: JwtService
  ) {}

  @Post('generate')
  // @UseGuards(AuthGuard('signup'))
  async register(@Res() res: Response, @Body(ValidationPipe) userDto: UserDto) {
    const {otpAuthUrl} =
      await this.twoFactorAuthService.generateTwoFactorAuthSecret(userDto);
    return await this.twoFactorAuthService.pipeQRCodeStream(res, otpAuthUrl);
  }

  @Post('turn-on')
  // @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuth(
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto
  ) {
    const isCodeValidated =
      await this.twoFactorAuthService.isTwoFactorAuthCodeValid(
        twoFactorAuthCodeDto
      );
    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Auth Code');
    }
    await this.twoFactorAuthService.changeTwoFactorAuthAvailability(
      twoFactorAuthCodeDto.user_id,
      true
    );
    return {
      msg: '2fa turned on',
    };
  }

  @Post('turn-off')
  // @UseGuards(AuthGuard('jwt'))
  async turnOffTwoFactorAuth(
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto
  ) {
    const isCodeValidated =
      await this.twoFactorAuthService.isTwoFactorAuthCodeValid(
        twoFactorAuthCodeDto
      );
    if (!isCodeValidated) {
      throw new UnauthorizedException('Invalid Auth Code');
    }
    await this.twoFactorAuthService.changeTwoFactorAuthAvailability(
      twoFactorAuthCodeDto.user_id,
      false
    );
    return {
      msg: '2fa turned off',
    };
  }

  @Post('authenticate')
  @UseGuards(AuthGuard('jwt'))
  async authenticate(
    @Request() req: any,
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto
  ): Promise<string> {
    // console.log('req: ', req);
    console.log('--------\nuser: ', req.user);
    this.twoFactorAuthService.authenticate(req.user, twoFactorAuthCodeDto);

    return req.user;
  }
}
