import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {SignUpController} from './signup.controller';
import {SignUpService} from './signup.service';
import {UserRepository} from 'src/user/user.repository';
import {IsUserAuth} from 'src/signup/signup.entity';
import {IsUserAuthRepository} from 'src/signup/signup.repository';
import {MulterModule} from '@nestjs/platform-express';
import {MulterConfigService} from 'src/imagefile/multer.config';
import {SignUpJwtStrategy} from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'signup'}),
    JwtModule.register({
      secret: 'Intra42',
      signOptions: {
        expiresIn: '2m',
      },
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([IsUserAuth]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [SignUpController],
  providers: [
    SignUpJwtStrategy,
    SignUpService,
    UserRepository,
    IsUserAuthRepository,
  ],
  exports: [TypeOrmModule],
})
export class SignUpModule {}
