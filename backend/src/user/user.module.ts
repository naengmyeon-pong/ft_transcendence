import {Module} from '@nestjs/common';
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './user.entitiy';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {JwtStrategy} from './jwt.strategy';
import {UserRepository} from 'src/user/user.repository';
import {isUserAuth} from 'src/signup/signup.entity';
import {isUserAuthRepository} from 'src/signup/signup.repository';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: 'Secret1234',
      signOptions: {
        expiresIn: 60 * 60,
      },
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([isUserAuth]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, UserRepository, isUserAuthRepository],
  exports: [JwtStrategy, PassportModule, TypeOrmModule, UserService],
})
export class UserModule {}
