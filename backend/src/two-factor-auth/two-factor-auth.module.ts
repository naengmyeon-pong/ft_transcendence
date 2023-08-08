import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {UserModule} from 'src/user/user.module';
import {UserRepository} from 'src/user/user.repository';
import {TwoFactorAuthController} from './two-factor-auth.controller';
import {TwoFactorAuthService} from './two-factor-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule, ConfigModule],
  providers: [UserRepository, TwoFactorAuthService],
  controllers: [TwoFactorAuthController],
})
export class TwoFactorAuthModule {}
