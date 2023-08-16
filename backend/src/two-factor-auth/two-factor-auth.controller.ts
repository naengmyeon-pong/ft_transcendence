import {UserRepository} from './../user/user.repository';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {TwoFactorAuthService} from './two-factor-auth.service';
import {AuthGuard} from '@nestjs/passport';
import {UserDto} from '@/user/dto/user.dto';
import {Response} from 'express';
import {TwoFactorAuthCodeDto} from './dto/two-factor-auth-code.dto';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

@Controller('2fa')
@ApiTags('2FA')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService, // private jwtService: JwtService
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  // @Get('test')
  // @UseGuards(AuthGuard('jwt'))
  // test(@Request() req) {
  //   return req.user;
  // }

  @Post('generate')
  @ApiOperation({
    summary: 'QR 코드 생성 API',
    description:
      '전달받은 user_id를 사용하여 시크릿 문자열을 저장 후 QR 코드를 반환함',
  })
  @ApiResponse({
    status: 201,
    description: '정상적으로 QR 코드가 생성된 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'QR 코드 생성 중 에러가 발생한 경우',
  })
  @UseGuards(AuthGuard('jwt'))
  async register(@Res() res: Response, @Request() req: any) {
    const userID: string = req.user.user_id;
    try {
      const {otpAuthUrl} =
        await this.twoFactorAuthService.generateTwoFactorAuthSecret(userID);
      return await this.twoFactorAuthService.pipeQRCodeStream(res, otpAuthUrl);
    } catch {
      // this.twoFactorAuthService.changeTwoFactorAuthAvailability(userID, false);
      throw new InternalServerErrorException();
    }
  }

  @Post('turn-on')
  @ApiOperation({
    summary: '2fa 사용 설정 API',
    description:
      '회원가입 시점 이후에 2fa를 사용하려는 경우, User 테이블의 is_2fa_enabled 값을 true로 변경함',
  })
  @ApiResponse({
    status: 201,
    description: '정상적으로 값을 변경한 경우',
  })
  @ApiResponse({
    status: 401,
    description: 'OTP 코드가 유효하지 않은 경우',
  })
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
  @ApiOperation({
    summary: '2fa 미사용 설정 API',
    description:
      '회원가입 시점 이후에 2fa를 미사용하려는 경우, User 테이블의 is_2fa_enabled 값을 false로 변경함',
  })
  @ApiResponse({
    status: 401,
    description: 'OTP 코드가 유효하지 않은 경우',
  })
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
  @ApiOperation({
    summary: 'OTP 코드 유효성 검증 API',
    description: '유저가 2차 인증을 위해 전달한 코드의 유효성을 검증함',
  })
  @ApiResponse({
    status: 201,
    description: '2차 인증에 성공한 경우',
  })
  @ApiResponse({
    status: 401,
    description: 'OTP 코드가 유효하지 않은 경우',
  })
  async authenticate(
    @Request() req: any,
    @Body() twoFactorAuthCodeDto: TwoFactorAuthCodeDto
  ): Promise<string> {
    const user = await this.userRepository.findOneBy({
      user_id: twoFactorAuthCodeDto.user_id,
    });
    if (user && twoFactorAuthCodeDto.user_pw === user.user_pw) {
      // if (user && (await bcrypt.compare(twoFactorAuthCodeDto.user_pw, user.user_pw))) {
      return this.twoFactorAuthService.authenticate(user, twoFactorAuthCodeDto);
    } else {
      throw new UnauthorizedException('Login failed');
    }
  }
}
