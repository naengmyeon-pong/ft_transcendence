import {ChatMemberRepository, DMRepository} from '@/chat/chat.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {IsNull, Not} from 'typeorm';

@Injectable()
export class DmService {
  constructor(
    private dmRepository: DMRepository,
    private chatMemberRepository: ChatMemberRepository
  ) {}

  async getDirectMessage(user_id: string, other_id: string) {
    const directmessage = await this.dmRepository.find({
      select: {
        userId: true,
        someoneId: true,
        message: true,
      },
      where: [
        {
          userId: user_id,
          someoneId: other_id,
          blockId: Not(user_id),
        },
        {
          userId: user_id,
          someoneId: other_id,
          blockId: IsNull(),
        },
        {
          userId: other_id,
          someoneId: user_id,
          blockId: Not(user_id),
        },
        {
          userId: other_id,
          someoneId: user_id,
          blockId: IsNull(),
        },
      ],
      order: {
        date: 'ASC',
      },
    });

    return directmessage;
  }

  async saveDirectMessage(
    user_id: string,
    target_id: string,
    message: string,
    blockId?: string
  ) {
    const dm = this.dmRepository.create({
      userId: user_id,
      someoneId: target_id,
      date: new Date(),
      message,
      blockId: blockId,
    });
    await this.dmRepository.save(dm);
  }

  async directMessageList(user_id: string) {
    const ret = [];

    const dm_list = await this.dmRepository
      .createQueryBuilder('dm')
      .select(['dm.userId', 'dm.someoneId', 'user_nickname', 'dm.message'])
      .innerJoin(
        'users',
        'users',
        `
      CASE
        WHEN dm.userId = :user_id THEN dm.someoneId = users.user_id
        WHEN dm.someoneId = :user_id THEN dm.userId = users.user_id
      END
    `,
        {user_id}
      )
      .where('dm.blockId != :user_id or dm.blockId is null', {user_id})
      .distinctOn(['user_nickname'])
      .orderBy('user_nickname')
      .getRawMany();

    dm_list.forEach(e => {
      const temp = {
        user1: user_id,
        user2: e.dm_userId === user_id ? e.dm_someoneId : e.dm_userId,
        nickname: e.user_nickname,
        last_message: e.dm_message,
      };
      ret.push(temp);
    });
    return ret;
  }

  async isChatMember(user_id: string) {
    if (!user_id) {
      throw new BadRequestException('empty parameter.');
    }
    const member = await this.chatMemberRepository.findOneBy({
      userId: user_id,
    });
    if (!member) {
      throw new NotFoundException(`${user_id} is not member of this chat.`);
    }
    return member;
  }
}
