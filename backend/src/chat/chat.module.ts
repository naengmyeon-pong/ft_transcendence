import {Module} from '@nestjs/common';
import {ChatGateway} from './chat.gateway';
import {ChatController} from './chat.controller';
import {ChatService} from './chat.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  BlockList,
  ChatBan,
  ChatMember,
  ChatRoom,
  DirectMessage,
} from './chat.entity';
import {
  BlockRepository,
  ChatBanRepository,
  ChatMemberRepository,
  ChatRoomRepository,
  DMRepository,
} from './chat.repository';
import {User} from 'src/user/user.entitiy';
import {UserRepository} from 'src/user/user.repository';
import {SocketArray} from 'src/globalVariable/global.socket';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom]),
    TypeOrmModule.forFeature([ChatMember]),
    TypeOrmModule.forFeature([ChatBan]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([BlockList]),
    TypeOrmModule.forFeature([DirectMessage]),
  ],
  providers: [
    ChatGateway,
    ChatService,
    ChatRoomRepository,
    ChatMemberRepository,
    ChatBanRepository,
    UserRepository,
    BlockRepository,
    DMRepository,
    SocketArray,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
