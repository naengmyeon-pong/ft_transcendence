import {
  BadRequestException,
  ConflictException,
  HttpCode,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {JwtService} from '@nestjs/jwt';

import axios from 'axios';
import * as bcrypt from 'bcryptjs';

import * as fs from 'fs';

import {User} from './user.entitiy';
import {UserDto} from './dto/user.dto';
import {UserAuthDto} from './dto/userAuth.dto';
import {UserRepository} from './user.repository';
import {IsUserAuthRepository} from 'src/signup/signup.repository';
import {Payload} from './payload';
import {UpdateUserDto} from './dto/update-user.dto';
import {SocketArray} from '@/global-variable/global.socket';
import {SignUpService} from '@/signup/signup.service';
import {OAuthUser} from '@/types/user/oauth';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userAuthRepository: IsUserAuthRepository,
    private signupService: SignUpService,
    private jwtService: JwtService,
    private socketArray: SocketArray
  ) {}

  async findUser(user_id: string): Promise<User> {
    if (!user_id) {
      throw new BadRequestException('유저아이디를 입력해주세요.');
    }
    const found = await this.userRepository.findOneBy({user_id});
    if (!found) {
      throw new NotFoundException(`${user_id}는 유저가 아닙니다.`);
    }
    return found;
  }

  async remove(user_id: string): Promise<void> {
    const result = await this.userRepository.delete(user_id);
    if (result.affected === 0) {
      throw new NotFoundException(`${user_id}는 유저가 아닙니다.`);
    }
  }

  async changePW(user_id: string, userDto: UpdateUserDto): Promise<void> {
    const user = await this.findUser(user_id);
    if (user) {
      //TODO: 주석 제거하기
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userDto.user_pw, salt);
      // user.user_pw = hashedPassword;
      user.user_pw = userDto.user_pw;
      await this.userRepository.save(user);
    } else {
      throw new NotFoundException(`${user_id}는 유저가 아닙니다.`);
    }
  }

  async signIn(userAuthDto: UserAuthDto): Promise<string | number> {
    if (this.socketArray.getUserSocket(userAuthDto.user_id)) {
      throw new ConflictException('로그인중인 유저입니다.');
    }
    const user = await this.findUser(userAuthDto.user_id);
    if (user && userAuthDto.user_pw === user.user_pw) {
      // TODO: 주석 제거해서 bcrpyt 적용하기
      // if (user && (await bcrypt.compare(userAuthDto.user_pw, user.user_pw))) {
      // user token create. (secret + Payload)
      if (user.is_2fa_enabled === false) {
        if (user.two_factor_auth_secret !== null) {
          // 2FA 미사용 유저의 시크릿 키 삭제
          await this.userRepository.update(
            {user_id: userAuthDto.user_id},
            {two_factor_auth_secret: null}
          );
        }
        const payload: Payload = {user_id: userAuthDto.user_id};
        const accessToken = this.generateAccessToken(payload);
        return accessToken;
      } else {
        // 2fa가 설정된 경우
        return HttpStatus.ACCEPTED;
      }
    }
    throw new UnauthorizedException('유저가 아닙니다.');
  }

  async getOAuthUser(code: string): Promise<string | OAuthUser> {
    const api_uri = process.env.INTRA_API_URI;
    const accessToken = await this.signupService.getAccessToken(code);

    const response = await axios.get(api_uri, {
      headers: {Authorization: `Bearer ${accessToken}`},
    });
    const user = await this.userRepository.findOneBy({
      user_id: response.data.login,
    });
    if (user) {
      if (user.is_2fa_enabled === false) {
        try {
          const payload: Payload = {user_id: response.data.login};
          const accessToken = this.generateAccessToken(payload);
          return accessToken;
        } catch (error) {
          console.log('getOAuthError', error);
          throw new InternalServerErrorException('서버에러가 발생했습니다.');
        }
      } else {
        return {status: HttpStatus.ACCEPTED, user_id: user.user_id};
      }
    } else {
      throw new NotFoundException('회원가입이 필요합니다.');
    }
  }

  async updateUser(
    userDto: UpdateUserDto,
    file: Express.Multer.File,
    userID: string
  ): Promise<void> {
    const user = await this.findUser(userID);
    // console.log(user, '\n', userDto, file);
    if (!user) {
      throw new UnauthorizedException('유저가 이닙니다.');
    }
    if (userDto.user_nickname) {
      await this.userRepository.update(
        {user_id: userID},
        {
          user_nickname: userDto.user_nickname,
        }
      );
    }
    if (file) {
      await this.userRepository.update(
        {user_id: userID},
        {
          user_image:
            `${process.env.NEXT_PUBLIC_BACKEND_SERVER}` + file.path.substr(11),
        }
      );
    }
  }

  generateAccessToken(payload: Payload) {
    return this.jwtService.sign(payload);
  }

  async setTwoFactorAuthSecret(userID: string, secret: string) {
    return this.userRepository.update(
      {user_id: userID},
      {
        two_factor_auth_secret: secret,
      }
    );
  }

  async turnOnTwoFactorAuth(userID: string) {
    return await this.userRepository.update(
      {user_id: userID},
      {
        is_2fa_enabled: true,
      }
    );
  }

  async turnOffTwoFactorAuth(userID: string) {
    return await this.userRepository.update(
      {user_id: userID},
      {
        two_factor_auth_secret: null,
        is_2fa_enabled: false,
      }
    );
  }

  async getUser(userID: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOneBy({user_id: userID});
    const userData: Partial<User> = {
      user_id: user.user_id,
      user_nickname: user.user_nickname,
      user_image: user.user_image,
      is_2fa_enabled: user.is_2fa_enabled,
      rank_score: user.rank_score,
    };
    return userData;
  }
}
