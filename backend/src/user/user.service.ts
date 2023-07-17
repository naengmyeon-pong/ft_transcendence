import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from './user.entitiy';
import {UserDto} from './dto/user.dto';
import {UserAuthDto} from './dto/userAuth.dto';
import {JwtService} from '@nestjs/jwt';
import {UserRepository} from './user.repository';
import {isUserAuthRepository} from 'src/signup/signup.repository';
import * as bcrypt from 'bcryptjs';
import {Payload} from './payload';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private userAuthRepository: isUserAuthRepository,
    private jwtService: JwtService
  ) {}

  async findOne(user_id: string): Promise<User> {
    const found = await this.userRepository.findOneBy({user_id});
    if (!found) {
      throw new NotFoundException(`${user_id} is not a member our site.`);
    }
    return found;
  }

  async create(userDto: UserDto, path: string): Promise<void> {
    const {user_id, user_pw, user_nickname, user_image, is_2fa_enabled} =
      userDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user_pw, salt);
    const userSignUpAuth = await this.userAuthRepository.findOneBy({user_id});
    if (!userSignUpAuth || userSignUpAuth.isNickSame === false) {
      fs.unlink(path, err => {
        if (err) throw new InternalServerErrorException();
      });
      throw new UnauthorizedException(
        'Please auth through our main signup page.'
      );
    }

    try {
      const user = this.userRepository.create({
        user_id,
        user_pw: hashedPassword,
        user_nickname,
        user_image: path,
        is_2fa_enabled,
      });
      await this.userRepository.save(user);
      await this.userAuthRepository.delete({user_id: user.user_id});
    } catch (error) {
      // fs.unlink(path, err => {
      //   if (err) throw new InternalServerErrorException();
      // });
      // if (error.code === '23505') {
      //   throw new ConflictException(
      //     `${userDto.user_nickname} can't use. Please input another nickname`
      //   );
      // } else {
      throw new InternalServerErrorException();
    }
  }

  async remove(user_id: string): Promise<void> {
    const result = await this.userRepository.delete(user_id);
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user ${user_id}`);
    }
  }

  async changePw(userAuthDto: UserAuthDto): Promise<User> {
    const user = await this.findOne(userAuthDto.user_id);

    user.user_pw = userAuthDto.user_pw;
    await this.userRepository.save(user);
    return user;
  }

  async signIn(userAuthDto: UserAuthDto): Promise<string> {
    const user = await this.findOne(userAuthDto.user_id);
    if (user && (await bcrypt.compare(userAuthDto.user_pw, user.user_pw))) {
      // user token create. (secret + Payload)
      const payload: Payload = {user_id: userAuthDto.user_id};
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    }
    throw new UnauthorizedException('login failed');
  }
}
