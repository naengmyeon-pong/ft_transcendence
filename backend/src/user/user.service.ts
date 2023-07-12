import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entitiy';
import { userDto } from './dto/user.dto';
import { userAuthDto } from './dto/userAuth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ){}

  async findOne(user_id : string) : Promise<User> {
    const found = await this.userRepository.findOneBy({user_id});
    if (!found) {
      throw new NotFoundException(`${user_id} is not a member our site.`);
    }
    return found;
  }

  async create(userDto: userDto) : Promise<void> {
    const {user_id, user_pw, user_nickname, user_image, second_auth} = userDto;
    const user = this.userRepository.create({user_id, user_pw, user_nickname, user_image, second_auth});
    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        console.log(error);
        throw new ConflictException(`${userDto.user_id} is already our member. plese sign in.`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async remove(user_id : string) : Promise<void> {
    const result = await this.userRepository.delete(user_id);
    if (result.affected === 0) {
      throw new NotFoundException(`Can't find user ${user_id}`);
    }
  }

  async updateUserPw(userAuthDto : userAuthDto ) : Promise<User> {
    let user = await this.findOne(userAuthDto.user_id);

    user.user_pw = userAuthDto.user_pw;
    await this.userRepository.save(user);
    return user;
  }

  async signIn(userAuthDto : userAuthDto) : Promise<string> {
    const user: Promise<User> = this.findOne(userAuthDto.user_id);
    if ((await user.then((found => found.user_pw === userAuthDto.user_pw)))) {
      // user token create. (secret + Payload)
      const payload = { user_id : userAuthDto.user_id };
      const accessToken = await this.jwtService.sign(payload);

      return accessToken;
    }
    throw new UnauthorizedException('login failed');
  }

  async secondAuth() {

  }

}
