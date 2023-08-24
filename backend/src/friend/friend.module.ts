import {Module} from '@nestjs/common';
import {FriendController} from './friend.controller';
import {FriendService} from './friend.service';
import {FriendGateway} from './friend.gateway';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ChatMember, FriendList} from '@/chat/chat.entity';
import {
  ChatMemberRepository,
  FriendListRepository,
} from '@/chat/chat.repository';
import {JwtCustomModule} from '@/utils/jwt-custom.module';
import {GlobalVariableModule} from '@/global-variable/global-variable.module';
import {User} from '@/user/user.entitiy';
import {UserRepository} from '@/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendList]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([ChatMember]),
    JwtCustomModule,
    GlobalVariableModule,
  ],
  controllers: [FriendController],
  providers: [
    FriendService,
    FriendGateway,
    FriendListRepository,
    UserRepository,
    ChatMemberRepository,
  ],
})
export class FriendModule {}
