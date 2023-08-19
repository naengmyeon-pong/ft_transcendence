import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {UserModule} from 'src/user/user.module';
import {UserRepository} from 'src/user/user.repository';
import {TwoFactorAuthController} from './two-factor-auth.controller';
import {TwoFactorAuthService} from './two-factor-auth.service';
import {JwtStrategy} from '@/user/jwt.strategy';
import {JwtCustomModule} from '@/utils/jwt-custom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    ConfigModule,
    JwtCustomModule,
  ],
  providers: [UserRepository, TwoFactorAuthService, JwtStrategy],
  controllers: [TwoFactorAuthController],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
