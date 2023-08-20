import {Global, Module} from '@nestjs/common';
import {SocketArray} from './global.socket';
import {Block} from './global.block';
import {BlockList} from '@/chat/chat.entity';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BlockRepository} from '@/chat/chat.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BlockList])],
  providers: [SocketArray, Block, BlockRepository],
  exports: [SocketArray, Block],
})
export class GlobalVariableModule {}
