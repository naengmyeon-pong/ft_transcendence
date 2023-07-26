import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {userTypeORMconf} from './configs/typeorm.config';
import {UserModule} from './user/user.module';
import {SignUpModule} from './signup/signup.module';
import * as Joi from 'joi';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {EventsModule} from './events/events.module';
import {GameModule} from './game/game.module';

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
        REACT_APP_OAUTH_URL: Joi.string().required(),
        REACT_APP_BACKEND_SERVER: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'assets'),
        renderPath: '/images',
      },
      {
        rootPath: join(__dirname, '..', 'assets'),
        renderPath: '/users',
      }
    ),
    TypeOrmModule.forRoot(userTypeORMconf),
    SignUpModule,
    UserModule,
    EventsModule,
    GameModule,
  ],
})
export class AppModule {}
