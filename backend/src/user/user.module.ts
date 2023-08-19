import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './user.entitiy';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from './jwt.strategy';
import {UserRepository} from 'src/user/user.repository';
import {IsUserAuth} from 'src/signup/signup.entity';
import {IsUserAuthRepository} from 'src/signup/signup.repository';
import {UserGateway} from './user.gateway';
import {SocketArray} from '@/globalVariable/global.socket';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: process.env.SIGNIN_JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '4h',
      },
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([IsUserAuth]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    JwtStrategy,
    UserRepository,
    IsUserAuthRepository,
    UserGateway,
    SocketArray,
  ],
  exports: [UserService],
})
export class UserModule {}
