import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {Payload} from 'src/user/payload';
import {isUserAuth} from './signup.entity';
import {isUserAuthRepository} from './signup.repository';

@Injectable()
export class SingUpJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userAuthRepository: isUserAuthRepository) {
    super({
      secretOrKey: 'Intra42',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: Payload) {
    const authUser: isUserAuth = await this.userAuthRepository.findOneBy({
      user_id: payload.user_id,
    });
    if (!authUser) {
      throw new UnauthorizedException('Not validate Jwt!');
    }
    return authUser;
  }
}
