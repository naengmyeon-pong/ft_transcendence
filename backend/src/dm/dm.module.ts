import {Module} from '@nestjs/common';
import {DmController} from './dm.controller';
import {DmService} from './dm.service';
import {DmGateway} from './dm.gateway';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from '@/user/user.entitiy';
import {DirectMessage} from '@/chat/chat.entity';
import {UserRepository} from '@/user/user.repository';
import {DMRepository} from '@/chat/chat.repository';
import {JwtCustomModule} from '@/utils/jwt-custom.module';
import {GlobalVariableModule} from '@/global-variable/global-variable.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([DirectMessage]),
    JwtCustomModule,
    GlobalVariableModule,
  ],
  controllers: [DmController],
  providers: [DmService, DmGateway, UserRepository, DMRepository],
})
export class DmModule {}
