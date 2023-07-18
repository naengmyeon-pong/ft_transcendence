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
import {JwtStrategy} from 'src/user/jwt.strategy';
import {MulterModule} from '@nestjs/platform-express';
import {MulterConfigService} from 'src/imagefile/multer.config';
import {SingUpJwtStrategy} from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'signup'}),
    JwtModule.register({
      secret: 'Intra42',
      signOptions: {
        expiresIn: 60 * 60,
      },
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([isUserAuth]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [SignupController],
  providers: [
    SingUpJwtStrategy,
    SignupService,
    UserService,
    UserRepository,
    isUserAuthRepository,
  ],
  exports: [TypeOrmModule],
})
export class SignupModule {}
