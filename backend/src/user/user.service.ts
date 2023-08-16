import {
  BadRequestException,
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from './user.entitiy';
import {UserDto} from './dto/user.dto';
import {UserAuthDto} from './dto/userAuth.dto';
import {JwtService} from '@nestjs/jwt';
import {UserRepository} from './user.repository';
import {IsUserAuthRepository} from 'src/signup/signup.repository';
import * as bcrypt from 'bcryptjs';
import {Payload} from './payload';
import {UpdateUserDto} from './dto/update-user.dto';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    // @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private userAuthRepository: IsUserAuthRepository,
    private jwtService: JwtService
  ) {}

  async findUser(user_id: string): Promise<User> {
    if (!user_id) {
      throw new BadRequestException('please, enter your ID');
    }
    const found = await this.userRepository.findOneBy({user_id});
    if (!found) {
      throw new NotFoundException(`${user_id} is not a member our site.`);
    }
    return found;
  }

  async remove(user_id: string): Promise<void> {
    const result = await this.userRepository.delete(user_id);
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user ${user_id}`);
    }
  }

  async changePW(userAuthDto: UserAuthDto): Promise<User> {
    const user = await this.findUser(userAuthDto.user_id);

    user.user_pw = userAuthDto.user_pw;
    await this.userRepository.save(user);
    return user;
  }

  // 로그인할 때 user pw 암호화 하지않게
  async signIn(userAuthDto: UserAuthDto): Promise<string | number> {
    const user = await this.findUser(userAuthDto.user_id);
    if (user && userAuthDto.user_pw === user.user_pw) {
      // if (user && (await bcrypt.compare(userAuthDto.user_pw, user.user_pw))) {
      // user token create. (secret + Payload)
      if (user.is_2fa_enabled === false) {
        const payload: Payload = {user_id: userAuthDto.user_id};
        const accessToken = this.generateAccessToken(payload);
        return accessToken;
      } else {
        // 2fa가 설정된 경우
        return HttpStatus.ACCEPTED;
      }
    }
    throw new UnauthorizedException('login failed');
  }
  // async signIn(userAuthDto: UserAuthDto): Promise<string> {
  //   const user = await this.findUser(userAuthDto.user_id);
  //   if (user && (await bcrypt.compare(userAuthDto.user_pw, user.user_pw))) {
  //     // user token create. (secret + Payload)
  //     const payload: Payload = {user_id: userAuthDto.user_id};
  //     const accessToken = this.jwtService.sign(payload);
  //     return accessToken;
  //   }
  //   throw new UnauthorizedException('login failed');
  // }

  async updateUser(
    userDto: UpdateUserDto,
    file: Express.Multer.File,
    userID: string
  ): Promise<void> {
    const user = await this.findUser(userID);
    console.log(user, '\n', userDto);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (userDto.user_pw) {
      await this.userRepository.update(
        {user_id: userID},
        {
          user_pw: userDto.user_pw,
        }
      );
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
      if (user.user_image === '/images/logo.jpeg') {
        await this.userRepository.update(
          {user_id: userID},
          {
            user_image: file.path.substr(11),
          }
        );
      }
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
}
