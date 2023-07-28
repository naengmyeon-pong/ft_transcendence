import {Module} from '@nestjs/common';
import {ChatGateway} from './chat.gateway';
import {ChatController} from './chat.controller';
import {ChatService} from './chat.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ChatBan, ChatMember, ChatRoom, SocketId} from './chat.entity';
import {
  ChatBanRepository,
  ChatMemberRepository,
  ChatRoomRepository,
  SocketRepository,
} from './chat.repository';
import {User} from 'src/user/user.entitiy';
import {UserRepository} from 'src/user/user.repository';
import {SocketArray} from 'src/globalVariable/global.socket';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom]),
    TypeOrmModule.forFeature([ChatMember]),
    TypeOrmModule.forFeature([ChatBan]),
    TypeOrmModule.forFeature([SocketId]),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    ChatGateway,
    ChatService,
    ChatRoomRepository,
    ChatMemberRepository,
    ChatBanRepository,
    SocketRepository,
    UserRepository,
    SocketArray,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
