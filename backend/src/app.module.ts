import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsModule } from './boards/boards.module';
import { typeORMConfig, userTypeORMconf } from './configs/typeorm.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SignupModule } from './signup/signup.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   cache: true,
    //   isGlobal: true,
    // }),
    // // TypeOrmModule.forRoot(typeORMConfig),
    // TypeOrmModule.forRoot(userTypeORMconf),
    // UserModule,
    // BoardsModule,
    SignupModule,
    // AuthModule
  ],
})
export class AppModule {}
