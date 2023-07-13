import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {isUserAuth} from 'src/signup/signup.entity';

export const userTypeORMconf: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, isUserAuth],
  synchronize: true,
};
