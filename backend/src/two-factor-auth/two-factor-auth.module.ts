import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {UserModule} from 'src/user/user.module';

@Module({
  imports: [UserModule, ConfigModule],
})
export class TwoFactorAuthModule {}
