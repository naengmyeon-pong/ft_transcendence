import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {InjectRepository} from '@nestjs/typeorm';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UserRepository} from './user.repository';
import {User} from './user.entitiy';
import {Repository} from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // @InjectRepository(UserRepository)
    // private userRepository : UserRepository
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      secretOrKey: 'Secret1234',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    const {user_id} = payload;
    const user: User = await this.userRepository.findOneBy({user_id});

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
