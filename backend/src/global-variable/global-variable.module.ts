import {Global, Module} from '@nestjs/common';
import {SocketArray} from './global.socket';
import {Block} from './global.block';
import {BlockList, FriendList} from '@/chat/chat.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BlockRepository, FriendListRepository} from '@/chat/chat.repository';
import {Friend} from './global.friend';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([BlockList]),
    TypeOrmModule.forFeature([FriendList]),
  ],
  providers: [
    SocketArray,
    Block,
    Friend,
    BlockRepository,
    FriendListRepository,
  ],
  exports: [SocketArray, Block, Friend],
})
export class GlobalVariableModule {}
