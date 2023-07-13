import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {UserService} from 'src/user/user.service';
import {SignupController} from './signup.controller';
import {SignupService} from './signup.service';
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
  controllers: [SignupController],
  providers: [SignupService, UserService, UserRepository, isUserAuthRepository],
  exports: [TypeOrmModule],
})
export class SignupModule {}
