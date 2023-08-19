import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  BlockRepository,
  ChatBanRepository,
  ChatMemberRepository,
  ChatRoomRepository,
  DMRepository,
  FriendListRepository,
} from './chat.repository';
import {UserRepository} from 'src/user/user.repository';
import {RoomDto} from './dto/room.dto';
import {SocketArray} from '@/global-variable/global.socket';
import {Block} from '@/global-variable/global.block';
import {DataSource, IsNull, Not} from 'typeorm';
import {ChatMember, ChatRoom} from './chat.entity';

export interface UserInfo {
  id: string;
  nickName: string;
  image: string;
}

@Injectable()
export class ChatService {
  constructor(
    private chatRoomRepository: ChatRoomRepository,
    private chatMemberRepository: ChatMemberRepository,
    private chatBanRepository: ChatBanRepository,
    private userRepository: UserRepository,
    private blockRepository: BlockRepository,
    private dmRepository: DMRepository,
    private friendListRepository: FriendListRepository,
    private socketArray: SocketArray,
    private block: Block,
    private dataSource: DataSource
  ) {}

  async getRoomList() {
    const room_list = [];
    const chatrooms = this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .select([
        'chatRoom.id',
        'chatRoom.name',
        'chatRoom.current_nums',
        'chatRoom.max_nums',
        'chatRoom.is_public',
        'chatRoom.is_password',
        'chatMember.permission',
        'chatMember.userId',
      ])
      .innerJoinAndSelect('chatRoom.chatmembers', 'chatMember')
      .innerJoinAndSelect('chatMember.user', 'users')
      .where('chatRoom.is_public = :is_public', {is_public: true})
      .andWhere('chatMember.permission = :permission', {permission: 2});

    const ret = await chatrooms.getMany();
    ret.forEach(element => {
      const temp = {
        id: element.id,
        name: element.name,
        current_nums: element.current_nums,
        max_nums: element.max_nums,
        is_public: element.is_public,
        is_password: element.is_password,
        owner: element.chatmembers[0].user.user_nickname,
      };
      room_list.push(temp);
    });
    return room_list;
  }

  async getRoomMembers(room_id: number) {
    const room_members = {
      owner: {}, // permission = 2
      admin: [], // permission = 1
      user: [], // permission = 0
    };

    const members = await this.chatMemberRepository
      .createQueryBuilder('chatMember')
      .innerJoinAndSelect('chatMember.user', 'users')
      .where('chatMember.chatroom.id = :chatroomId', {chatroomId: room_id})
      .getMany();

    members.forEach(e => {
      const userinfo: UserInfo = {
        id: e.user.user_id,
        nickName: e.user.user_nickname,
        image: e.user.user_image,
      };

      if (e.permission === 0) {
        room_members.user.push(userinfo);
      } else if (e.permission === 1) {
        room_members.admin.push(userinfo);
      } else {
        room_members.owner = userinfo;
      }
    });
    return room_members;
  }

  async createRoom(roomDto: RoomDto) {
    // user_id 가 속해있는지. postman으로 날렸을 때 안되도록. jwt 사용하면 없어도 될수도..?
    const user = await this.userRepository.findOneBy({
      user_id: roomDto.user_id,
    });
    if (!user) {
      throw new NotFoundException(`${roomDto.user_id} is not our member`);
    }
    // user_id의 owner가 있으면 방을 만들지 않도록. 1명의 owner당 1개의 채팅방만 만들 수 있어서.
    const already = await this.chatMemberRepository.find({
      where: {
        userId: roomDto.user_id,
        permission: 2,
      },
    });
    if (already.length !== 0) {
      throw new ConflictException(
        `${roomDto.user_id} is already owner ${already[0].chatroomId}`
      );
    }

    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      const room = this.chatRoomRepository.create({
        name: roomDto.room_name,
        current_nums: 1,
        max_nums: roomDto.max_nums,
        is_public: roomDto.is_public,
        is_password: roomDto.is_password,
        password: roomDto.password,
      });
      await query_runner.manager.getRepository(ChatRoom).save(room);
      const room_member = this.chatMemberRepository.create({
        permission: 2,
        mute: null,
        chatroom: room,
        user: user,
      });
      await query_runner.manager.getRepository(ChatMember).save(room_member);
      await query_runner.commitTransaction();
      return room;
    } catch (e) {
      await query_runner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await query_runner.release();
    }
  }

  async joinRoom(room_id: number, user_id: string) {
    // 우리 서버의 user가 맞는지 확인하고, 채팅방에 member로 등록되어있는지 확인
    if (!room_id || !user_id) {
      throw new BadRequestException('empty parameter.');
    }
    const user = await this.getUser(user_id);

    // ban_list에 등록되어 있는지 확인
    const ban_member = await this.chatBanRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (ban_member) {
      throw new ForbiddenException(`${user_id} is ban this room.`);
    }

    const member = await this.chatMemberRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (member) {
      return false;
    }

    // room 인원 증가시키고, room_member에 추가
    const room = await this.getRoom(room_id);
    if (room.current_nums >= room.max_nums) {
      // 새로운 유저라서 방에 추가해줘야 하는데, 방 인원이 꽉 찼을 경우
      throw new ConflictException('sorry, room is full!');
    }
    room.current_nums += 1;
    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();
    try {
      await query_runner.manager.getRepository(ChatRoom).save(room);
      const new_member = this.chatMemberRepository.create({
        permission: 0,
        mute: null,
        chatroom: room,
        userId: user_id,
      });
      await query_runner.manager.getRepository(ChatMember).save(new_member);
      await query_runner.commitTransaction();
      return true;
    } catch (e) {
      await query_runner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await query_runner.release();
    }
  }

  async leaveRoom(room_id: number, user_id: string) {
    // throw new InternalServerErrorException();
    if (!room_id || !user_id) {
      throw new BadRequestException('empty parameter.');
    }
    const user = await this.getUser(user_id);
    const room = await this.chatRoomRepository.findOneBy({id: room_id});
    if (!room) {
      return;
    }

    const member = await this.chatMemberRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (!member) {
      return;
    } else if (member.permission === 2) {
      //owner 일 때 방 전체가 터지게. // 여기에서 다 처리해야될듯 front한테 부르는게 아니라.
      await this.chatRoomRepository.delete({id: room_id});
      return member;
    } else {
      await this.chatMemberRepository.delete({
        userId: member.userId,
        chatroomId: room_id,
      });
      room.current_nums -= 1;
      await this.chatRoomRepository.save(room);
      return member;
    }
  }

  async addToAdmin(room_id: number, user_id: string, target_id: string) {
    if (this.isOwner(room_id, user_id)) {
      const member = await this.isChatMember(target_id);
      member.permission = 1;
      await this.chatMemberRepository.save(member);
      return true;
    }
    return false;
  }

  async delAdmin(room_id: number, user_id: string, target_id: string) {
    if (this.isOwner(room_id, user_id)) {
      const member = await this.isChatMember(target_id);
      member.permission = 0;
      await this.chatMemberRepository.save(member);
      return true;
    }
    return false;
  }

  async kickMember(room_id: number, user_id: string, target_id: string) {
    const admin = await this.isChatMember(user_id);
    const member = await this.isChatMember(target_id);

    if (admin.permission > member.permission) {
      return true;
    }
    return false;
  }

  async muteMember(
    room_id: number,
    user_id: string,
    target_id: string,
    mute_time: string
  ) {
    const admin = await this.isChatMember(user_id);
    const member = await this.isChatMember(target_id);

    if (admin.permission > member.permission) {
      member.mute = mute_time;
      this.chatMemberRepository.save(member);
    }
  }

  async banMember(room_id: number, user_id: string, target_id: string) {
    const admin = await this.isChatMember(user_id);
    const member = await this.isChatMember(target_id);

    if (admin.permission > member.permission) {
      const ban_member = this.chatBanRepository.create({
        chatroomId: room_id,
        userId: target_id,
      });
      await this.chatBanRepository.save(ban_member);
      return true;
    }
    return false;
  }

  async blockMember(user_id: string, target_id: string) {
    const block_list = this.blockRepository.create({
      userId: user_id,
      blockId: target_id,
    });
    await this.blockRepository.save(block_list);
    this.block.addBlockUser(user_id, target_id);
  }

  async unBlockMember(user_id: string, target_id: string) {
    await this.blockRepository.delete({
      userId: user_id,
      blockId: target_id,
    });
    this.block.removeBlockUser(user_id, target_id);
  }

  async isOwner(room_id: number, user_id: string) {
    const member = await this.isChatMember(user_id);
    if (member.permission === 2) {
      return true;
    }
    return false;
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

  async getUser(user_id: string) {
    const user = await this.userRepository.findOneBy({user_id});
    if (!user) {
      throw new NotFoundException(`${user_id} is not a user.`);
    }
    return user;
  }

  async getRoom(room_id: number) {
    const room = await this.chatRoomRepository.findOneBy({id: room_id});
    if (!room) {
      throw new NotFoundException('Please enter right chat room.');
    }
    return room;
  }

  //초대 검색할 때, 채팅방에 있는 사람 제외하고, 차단 유저 제외하고 비슷한 닉네임 다 조회.
  async getLoginUser(user_nickname: string, user_id: string) {
    if (!user_nickname) {
      throw new BadRequestException('empty user_nickname param.');
    }

    const users = await this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.user_id AS "id"',
        'users.user_nickname AS "nickName"',
        'users.user_image AS "image"',
      ])
      .leftJoin('users.chatmembers', 'chatmember')
      .leftJoin('users.blocklist', 'block', 'block.userId=:user_id', {user_id})
      .where('users.user_nickname like :nickname', {
        nickname: `${user_nickname}%`,
      })
      .andWhere('chatmember.userId is null and block.userId is null')
      .orWhere('chatmember.userId is null and block.userId != :user_id', {
        user_id,
      })
      .orderBy('user_nickname')
      .getRawMany();

    const ret = [];
    users.forEach(user => {
      if (this.socketArray.getUserSocket(user.id)) {
        ret.push(user);
      }
    });
    return ret;
  }

  // 자기자신, 차단유저, 친구목록에 있는 유저 빼고.
  async searchUser(user_id: string, user_nickname: string) {
    if (!user_nickname) {
      throw new BadRequestException('empty user_nickname param.');
    }
    const users = await this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.user_id AS "id"',
        'users.user_nickname AS "nickName"',
        'users.user_image AS "image"',
      ])
      .leftJoin('users.friend', 'friend', 'friend.userId = :user_id', {user_id})
      .leftJoin('users.blocklist', 'block', 'block.userId = :user_id', {
        user_id,
      })
      .where('users.user_nickname like :nickname', {
        nickname: `${user_nickname}%`,
      })
      .andWhere('users.user_id != :user_id', {user_id})
      .andWhere('block.userId is null')
      .andWhere('friend.userId is null')
      .orderBy('user_nickname')
      .getRawMany();

    return users;
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
      const status = this.socketArray.getUserSocket(element.id);
      if (status) {
        if (status.is_gaming) {
          element.status = 2;
        }
        element.status = 1;
      } else {
        element.status = 0;
      }
    });
    return ret;
  }

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

  async getBlockList(user_id: string) {
    if (!user_id) {
      throw new BadRequestException('empty user_id param.');
    }

    const block_list = await this.blockRepository
      .createQueryBuilder('block')
      .select([
        'user_id AS "id"',
        'user_nickname AS "nickName"',
        'user_image AS "image"',
      ])
      .innerJoin('block.blockUser', 'users', 'block.blockId = users.user_id')
      .where('block.userId = :user_id', {user_id})
      .getRawMany();

    return block_list;
  }

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
      .select(['dm.userId', 'dm.someoneId', 'user_nickname'])
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
      .distinctOn(['user_nickname'])
      .orderBy('user_nickname')
      .getRawMany();

    dm_list.forEach(e => {
      const temp = {
        user1: user_id,
        user2: e.dm_userId === user_id ? e.dm_someoneId : e.dm_userId,
        nickname: e.user_nickname,
      };
      ret.push(temp);
    });
    return ret;
  }

  async checkChatRoomPw(room_id: number, password: number): Promise<boolean> {
    const room = await this.getRoom(room_id);
    if (room.password === password) {
      return true;
    }
    return false;
  }

  async updateChatRoomPw(room_id: number, password?: number) {
    const room = await this.getRoom(room_id);
    if (password) {
      room.password = password;
    } else {
      room.password = null;
      room.is_password = false;
    }
    await this.chatRoomRepository.save(room);
  }
}
