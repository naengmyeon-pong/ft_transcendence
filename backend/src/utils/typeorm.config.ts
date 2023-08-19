import {TypeOrmModuleOptions} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {IsUserAuth} from 'src/signup/signup.entity';
import {
  ChatBan,
  ChatMember,
  ChatRoom,
  BlockList,
  DirectMessage,
  FriendList,
} from 'src/chat/chat.entity';
import {Record} from 'src/record/record.entity';
import {Type} from 'src/record/type/type.entity';
import {Mode} from 'src/record/mode/mode.entity';

export const userTypeORMconf: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    User,
    IsUserAuth,
    ChatRoom,
    ChatBan,
    ChatMember,
    BlockList,
    DirectMessage,
    FriendList,
    Record,
    Type,
    Mode,
  ],
  synchronize: true,
  // logging: true,
};
