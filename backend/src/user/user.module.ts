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
import {MulterModule} from '@nestjs/platform-express';
import {MulterConfigService} from '@/utils/multer.config';
import {UserGateway} from './user.gateway';
import {SocketArray} from '@/global-variable/global.socket';
import {JwtCustomModule} from '@/utils/jwt-custom.module';

@Module({
  imports: [
    JwtCustomModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([IsUserAuth]),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
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
