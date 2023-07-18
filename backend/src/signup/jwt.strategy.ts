import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy, ExtractJwt} from 'passport-jwt';
import {Payload} from 'src/user/payload';
import {IsUserAuth} from './signup.entity';
import {IsUserAuthRepository} from './signup.repository';

@Injectable()
export class SignUpJwtStrategy extends PassportStrategy(Strategy, 'signup') {
  constructor(private userAuthRepository: IsUserAuthRepository) {
    super({
      secretOrKey: 'Intra42',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: Payload) {
    console.log('validate');
    const authUser: IsUserAuth = await this.userAuthRepository.findOneBy({
      user_id: payload.user_id,
    });
    if (!authUser) {
      throw new UnauthorizedException('Not validate Jwt!');
    }
    return authUser;
  }
}
