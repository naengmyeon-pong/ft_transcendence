import {ConfigService} from '@nestjs/config';
import {User} from 'src/user/user.entitiy';
import {UserService} from 'src/user/user.service';
import {authenticator} from 'otplib';
import {Response} from 'express';
import {toFileStream} from 'qrcode';
import {Injectable} from '@nestjs/common';
import {UserDto} from 'src/user/dto/user.dto';

interface twoFactorAuth {
  secret: string;
  otpAuthUrl: string;
}

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  public async generateTwoFactorAuthSecret(
    userDto: UserDto
  ): Promise<twoFactorAuth> {
    const secret: string = authenticator.generateSecret();

    const otpAuthUrl: string = authenticator.keyuri(
      userDto.user_id,
      process.env.TWO_FACTOR_AUTH_APP_NAME,
      secret
    );

    const twoFactorAuth: twoFactorAuth = {secret, otpAuthUrl};

    await this.userService.setTwoFactorAuthSecret(userDto.user_id, secret);

    return twoFactorAuth;
  }

  public async pipeQRCodeStream(
    stream: Response,
    otpAuthUrl: string
  ): Promise<void> {
    return toFileStream(stream, otpAuthUrl);
  }
}
