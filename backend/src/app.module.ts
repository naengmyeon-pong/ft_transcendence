import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {userTypeORMconf} from './configs/typeorm.config';
import {UserModule} from './user/user.module';
import {SignUpModule} from './signup/signup.module';
import * as Joi from 'joi';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {ChatModule} from './chat/chat.module';
import {GameModule} from './game/game.module';
import {TwoFactorAuthModule} from './two-factor-auth/two-factor-auth.module';
import {RecordModule} from './record/record.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        PGADMIN_DEFAULT_EMAIL: Joi.string().required(),
        PGADMIN_DEFAULT_PASSWORD: Joi.string().required(),
        INTRA_AUTH_URI: Joi.string().required(),
        INTRA_TOKEN_URI: Joi.string().required(),
        INTRA_API_URI: Joi.string().required(),
        INTRA_API_UID: Joi.string().required(),
        INTRA_API_SECRET: Joi.string().required(),
        INTRA_API_REDIRECT_URI: Joi.string().required(),
        NEXT_PUBLIC_OAUTH_URL: Joi.string().required(),
        NEXT_PUBLIC_BACKEND_SERVER: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '../../', 'assets'),
        renderPath: '/images',
      },
      {
        rootPath: join(__dirname, '../../', 'assets'),
        renderPath: '/users',
      }
    ),
    TypeOrmModule.forRoot(userTypeORMconf),
    SignUpModule,
    UserModule,
    ChatModule,
    GameModule,
    ConfigModule,
    TwoFactorAuthModule,
    RecordModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
