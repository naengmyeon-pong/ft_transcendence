import {PartialType} from '@nestjs/swagger';
import {RoomDto} from './room.dto';

export class PartialRoomDto extends PartialType(RoomDto) {}
