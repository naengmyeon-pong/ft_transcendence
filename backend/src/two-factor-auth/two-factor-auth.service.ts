import {ConfigService} from '@nestjs/config';
import {User} from 'src/user/user.entitiy';
import {UserService} from 'src/user/user.service';
import {authenticator} from 'otplib';
import {Response} from 'express';
import {toFileStream} from 'qrcode';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {TwoFactorAuthCodeDto} from './dto/two-factor-auth-code.dto';
import {UserRepository} from 'src/user/user.repository';
import {Payload} from 'src/user/payload';

interface twoFactorAuth {
  secret: string;
  otpAuthUrl: string;
}

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private userRepository: UserRepository
  ) {}

  public async generateTwoFactorAuthSecret(
    userID: string
  ): Promise<twoFactorAuth> {
    const secret: string = authenticator.generateSecret();

    const otpAuthUrl: string = authenticator.keyuri(
      userID,
      process.env.TWO_FACTOR_AUTH_APP_NAME,
      secret
    );

    const twoFactorAuth: twoFactorAuth = {secret, otpAuthUrl};

    await this.userService.setTwoFactorAuthSecret(userID, secret);

    return twoFactorAuth;
  }

  public async pipeQRCodeStream(
    stream: Response,
    otpAuthUrl: string
  ): Promise<void> {
    return toFileStream(stream, otpAuthUrl);
  }

  public async isTwoFactorAuthCodeValid(
    userID: string,
    twoFactorAuthCodeDto: Partial<TwoFactorAuthCodeDto>
  ) {
    const user = await this.userRepository.findOneBy({
      user_id: userID,
    });
    if (!user.two_factor_auth_secret) {
      return false;
    }

    return authenticator.verify({
      token: twoFactorAuthCodeDto.code,
      secret: user.two_factor_auth_secret,
    });
  }

  public async changeTwoFactorAuthAvailability(
    userID: string,
    isTurnOn: boolean
  ) {
    if (isTurnOn === true) {
      await this.userService.turnOnTwoFactorAuth(userID);
    } else {
      await this.userService.turnOffTwoFactorAuth(userID);
    }
  }

  async authenticate(user: User, twoFactorAuthCodeDto: TwoFactorAuthCodeDto) {
    if (user.is_2fa_enabled === false) {
      throw new ForbiddenException('Two-Factor Authentication is not enabled');
    }
    const isCodeValidated = await this.isTwoFactorAuthCodeValid(
      user.user_id,
      twoFactorAuthCodeDto
    );
    if (isCodeValidated === false) {
      throw new UnauthorizedException('Invalid Auth Code');
    }
    // user.is_2fa_authenticated = true;
    const payload: Payload = {user_id: user.user_id};
    const AccessToken = this.userService.generateAccessToken(payload);
    return AccessToken;
  }
}
