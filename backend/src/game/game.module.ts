import {Module} from '@nestjs/common';
import {GameGateway} from './game.gateway';
import {RecordRepository} from 'src/record/record.repository';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/user/user.entitiy';
import {Record} from 'src/record/record.entity';
import {UserRepository} from 'src/user/user.repository';
import {Mode} from 'src/record/mode/mode.entity';
import {Type} from 'src/record/type/type.entity';
import {ModeRepository} from 'src/record/mode/mode.repository';
import {TypeRepository} from 'src/record/type/type.repository';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from 'src/user/jwt.strategy';
import {GameService} from './game.service';
import {JwtCustomModule} from '@/utils/jwt-custom.module';
import {GlobalVariableModule} from '@/global-variable/global-variable.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Record]),
    TypeOrmModule.forFeature([Mode]),
    TypeOrmModule.forFeature([Type]),
    JwtCustomModule,
    GlobalVariableModule,
  ],
  providers: [
    GameGateway,
    RecordRepository,
    UserRepository,
    ModeRepository,
    TypeRepository,
    JwtStrategy,
    GameService,
  ],
})
export class GameModule {}
