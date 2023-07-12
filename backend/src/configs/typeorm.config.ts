import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Board } from "src/boards/board.entitiy";
import { User } from "src/user/user.entitiy";

export const typeORMConfig : TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'hello',
  password: 'world',
  database: 'pong',
  // entities: [__dirname + '/../**/*.entitiy.{js,ts}'],
  entities : [User, Board],
  synchronize: true
}

export const userTypeORMconf : TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Board],
  synchronize: true
}