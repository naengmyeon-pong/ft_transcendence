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
  FriendList,
} from './chat.entity';
import {
  BlockRepository,
  ChatBanRepository,
  ChatMemberRepository,
  ChatRoomRepository,
  DMRepository,
  FriendListRepository,
} from './chat.repository';
import {User} from 'src/user/user.entitiy';
import {UserRepository} from 'src/user/user.repository';
import {SocketArray} from 'src/globalVariable/global.socket';
import {Block} from 'src/globalVariable/global.block';
import {JwtcustomeModule} from '@/jwtcustome/jwtcustome.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom]),
    TypeOrmModule.forFeature([ChatMember]),
    TypeOrmModule.forFeature([ChatBan]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([BlockList]),
    TypeOrmModule.forFeature([DirectMessage]),
    TypeOrmModule.forFeature([FriendList]),
    JwtcustomeModule,
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
    FriendListRepository,
    SocketArray,
    Block,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
