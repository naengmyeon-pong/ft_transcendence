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

  async create(userDto: UserDto): Promise<void> {
    const {user_id, user_pw, user_nickname, user_image, is_2fa_enabled} =
      userDto;
    const userSignUpAuth = await this.userAuthRepository.findOneBy({user_id});
    if (!userSignUpAuth || userSignUpAuth.isAuth === false) {
      throw new UnauthorizedException(
        'Please auth through our main signup page.'
      );
    }
    const user = this.userRepository.create({
      user_id,
      user_pw,
      user_nickname,
      user_image,
      is_2fa_enabled,
    });
    try {
      await this.userRepository.save(user);
      await this.userAuthRepository.delete({user_id: user.user_id});
    } catch (error) {
      if (error.code === '23505') {
        console.log(error);
        throw new ConflictException(
          `${userDto.user_id} is already our member. plese sign in.`
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async remove(user_id: string): Promise<void> {
    const result = await this.userRepository.delete(user_id);
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user ${user_id}`);
    }
  }

  async updateUserPw(userAuthDto: UserAuthDto): Promise<User> {
    const user = await this.findOne(userAuthDto.user_id);

    user.user_pw = userAuthDto.user_pw;
    await this.userRepository.save(user);
    return user;
  }

  async signIn(userAuthDto: UserAuthDto): Promise<string> {
    const user: Promise<User> = this.findOne(userAuthDto.user_id);
    if (await user.then(found => found.user_pw === userAuthDto.user_pw)) {
      // user token create. (secret + Payload)
      const payload = {user_id: userAuthDto.user_id};
      const accessToken = await this.jwtService.sign(payload);

      return accessToken;
    }
    throw new UnauthorizedException('login failed');
  }
}
