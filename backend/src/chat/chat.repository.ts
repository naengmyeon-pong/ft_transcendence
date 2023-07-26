import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {ChatBan, ChatMember, ChatRoom, SocketId} from './chat.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class ChatRoomRepository extends Repository<ChatRoom> {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoom: Repository<ChatRoom>
  ) {
    super(chatRoom.target, chatRoom.manager, chatRoom.queryRunner);
  }
}

@Injectable()
export class ChatMemberRepository extends Repository<ChatMember> {
  constructor(
    @InjectRepository(ChatMember)
    private readonly chatmember: Repository<ChatMember>
  ) {
    super(chatmember.target, chatmember.manager, chatmember.queryRunner);
  }
}

@Injectable()
export class ChatBanRepository extends Repository<ChatBan> {
  constructor(
    @InjectRepository(ChatBan)
    private readonly chatban: Repository<ChatBan>
  ) {
    super(chatban.target, chatban.manager, chatban.queryRunner);
  }
}

@Injectable()
export class SocketRepository extends Repository<SocketId> {
  constructor(
    @InjectRepository(SocketId)
    private readonly socketId: Repository<SocketId>
  ) {
    super(socketId.target, socketId.manager, socketId.queryRunner);
  }
}
