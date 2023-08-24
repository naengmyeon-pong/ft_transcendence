import {
  ChatMemberRepository,
  FriendListRepository,
} from '@/chat/chat.repository';
import {SocketArray} from '@/global-variable/global.socket';
import {UserRepository} from '@/user/user.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class FriendService {
  constructor(
    private friendListRepository: FriendListRepository,
    private userRepository: UserRepository,
    private socketArray: SocketArray,
    private chatMemberRepository: ChatMemberRepository
  ) {}

  async addFriend(user_id: string, friend_id: string) {
    // const user = await this.getUser(user_id);
    // const friend = await this.getUser(friend_id);

    const new_friend = this.friendListRepository.create({
      userId: user_id,
      friendId: friend_id,
    });
    await this.friendListRepository.save(new_friend);
  }

  async delFriend(user_id: string, friend_id: string) {
    // const user = await this.getUser(user_id);
    // const friend = await this.getUser(friend_id);
    await this.friendListRepository.delete({
      userId: user_id,
      friendId: friend_id,
    });
  }

  async getFriendList(user_id: string) {
    const ret = await this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.user_id AS "id"',
        'users.user_nickname AS "nickName"',
        'users.user_image AS "image"',
      ])
      .innerJoin(
        'users.friend',
        'friend',
        `
      CASE 
        WHEN friend.friendId=users.user_id THEN friend.userId = :user_id END
      `,
        {user_id}
      )
      .leftJoin(
        'users.blocklist',
        'bl',
        `
      CASE
        WHEN bl.blockId = users.user_id THEN bl.userId = :user_id END`,
        {user_id}
      )
      .where('bl.blockId is null')
      .getRawMany();

    ret.forEach(element => {
      const state = this.socketArray.getUserSocket(element.id);
      if (state) {
        if (state.is_gaming) {
          element.state = '게임 중';
        }
        element.state = '온라인';
      } else {
        element.state = '오프라인';
      }
    });
    return ret;
  }

  async getUsersAsFriend(user_id: string) {
    const ret = await this.friendListRepository.find({
      where: {
        friendId: user_id,
      },
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
