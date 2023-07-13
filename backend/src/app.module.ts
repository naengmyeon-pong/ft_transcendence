import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {userTypeORMconf} from './configs/typeorm.config';
import {UserModule} from './user/user.module';
import {SignupModule} from './signup/signup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(userTypeORMconf),
    SignupModule,
    UserModule,
  ],
})
export class AppModule {}
