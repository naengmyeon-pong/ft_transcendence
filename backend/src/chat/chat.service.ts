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
} from './chat.repository';
import {UserRepository} from 'src/user/user.repository';
import {RoomDto} from './dto/room.dto';
import {SocketArray} from '@/global-variable/global.socket';
import {Block} from '@/global-variable/global.block';
import {DataSource, QueryRunner} from 'typeorm';
import {BlockList, ChatBan, ChatMember, ChatRoom} from './chat.entity';
import * as bcrypt from 'bcryptjs';
import {PartialRoomDto} from './dto/partial-room.dto';
import {User} from '@/user/user.entitiy';

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
    private socketArray: SocketArray,
    private block: Block,
    private dataSource: DataSource
  ) {}

  async getRoomList(): Promise<any> {
    const chatrooms: any = await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .select([
        'chatRoom.id AS "id"',
        'chatRoom.name AS "name"',
        'chatRoom.current_nums AS "current_nums"',
        'chatRoom.max_nums AS "max_nums"',
        'chatRoom.is_public AS "is_public"',
        'chatRoom.is_password AS "is_password"',
        'users.user_nickname AS "owner"',
      ])
      .innerJoin(
        'chatRoom.chatmembers',
        'chatMember',
        'chatMember.chatroomId = chatRoom.id'
      )
      .innerJoin(
        'chatMember.user',
        'users',
        'chatMember.userId = users.user_id'
      )
      .where('chatRoom.is_public = :is_public', {is_public: true})
      .andWhere('chatMember.permission = :permission', {permission: 2})
      .getRawMany();

    return chatrooms;
  }

  async getRoomMembers(room_id: number): Promise<any> {
    if (!room_id) {
      throw new BadRequestException('채팅방 아이디를 입력해주세요.');
    }
    const room_members: any = {
      owner: {}, // permission = 2
      admin: [], // permission = 1
      user: [], // permission = 0
    };

    const members: ChatMember[] = await this.chatMemberRepository
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

  async createRoom(roomDto: RoomDto): Promise<ChatRoom> {
    const user: User = await this.userRepository.findOneBy({
      user_id: roomDto.user_id,
    });
    if (!user) {
      throw new NotFoundException(`${roomDto.user_id}는 유저가 아닙니다.`);
    }
    // user_id의 owner가 있으면 방을 만들지 않도록. 1명의 owner당 1개의 채팅방만 만들 수 있어서.
    const already: ChatMember[] = await this.chatMemberRepository.find({
      where: {
        userId: roomDto.user_id,
        permission: 2,
      },
    });
    if (already.length !== 0) {
      throw new ConflictException(
        `${roomDto.user_id}는 이미 채팅방의 주인입니다.`
      );
    }
    const query_runner: QueryRunner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      let hashedPassword: string;
      if (roomDto.password) {
        const salt: any = await bcrypt.genSalt();
        hashedPassword = await bcrypt.hash(roomDto.password, salt);
      }
      const room = this.chatRoomRepository.create({
        name: roomDto.room_name,
        current_nums: 1,
        max_nums: roomDto.max_nums,
        is_public: roomDto.is_public,
        is_password: roomDto.is_password,
        password: roomDto.password ? hashedPassword : roomDto.password,
      });
      await query_runner.manager.getRepository(ChatRoom).save(room);
      const room_member: ChatMember = this.chatMemberRepository.create({
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
      throw new InternalServerErrorException('서버에러가 발생했습니다.');
    } finally {
      await query_runner.release();
    }
  }

  async joinRoom(room_id: number, user_id: string) {
    // 우리 서버의 user가 맞는지 확인하고, 채팅방에 member로 등록되어있는지 확인
    if (!room_id || !user_id) {
      throw new BadRequestException(
        '채팅방 아이디와 유저 아이디를 올바르게 입력해주세요.'
      );
    }
    const member: ChatMember = await this.chatMemberRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (member) {
      return false;
    }

    // room 인원 증가시키고, room_member에 추가
    const room: ChatRoom = await this.getRoom(room_id);
    room.current_nums += 1;
    const query_runner: QueryRunner = this.dataSource.createQueryRunner();
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
      throw new InternalServerErrorException('서버에러가 발생했습니다.');
    } finally {
      await query_runner.release();
    }
  }

  async leaveRoom(room_id: number, user_id: string): Promise<ChatMember> {
    if (!room_id || !user_id) {
      throw new BadRequestException(
        '채팅방 아이디와 유저 아이디를 올바르게 입력해주세요.'
      );
    }
    const room: ChatRoom = await this.chatRoomRepository.findOneBy({
      id: room_id,
    });
    if (!room) {
      return;
    }

    const member: ChatMember = await this.chatMemberRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (!member) {
      return;
    } else if (member.permission === 2) {
      //owner 일 때 방 전체가 터지게.
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

  async addToAdmin(
    room_id: number,
    user_id: string,
    target_id: string
  ): Promise<boolean> {
    if (!room_id) {
      throw new BadRequestException('채팅방 아이디를 입력해주세요.');
    } else if (!target_id) {
      throw new BadRequestException('상대방 아이디를 입력해주세요.');
    }
    if (this.isOwner(room_id, user_id)) {
      const member: ChatMember = await this.isThisChatMember(
        room_id,
        target_id
      );
      member.permission = 1;
      await this.chatMemberRepository.save(member);
      return true;
    }
    return false;
  }

  async delAdmin(
    room_id: number,
    user_id: string,
    target_id: string
  ): Promise<boolean> {
    if (!room_id) {
      throw new BadRequestException('채팅방 아이디를 입력해주세요.');
    } else if (!target_id) {
      throw new BadRequestException('상대방 아이디를 입력해주세요.');
    }
    if (this.isOwner(room_id, user_id)) {
      const member: ChatMember = await this.isThisChatMember(
        room_id,
        target_id
      );
      member.permission = 0;
      await this.chatMemberRepository.save(member);
      return true;
    }
    return false;
  }

  async kickMember(
    room_id: number,
    user_id: string,
    target_id: string
  ): Promise<boolean> {
    if (!room_id) {
      throw new BadRequestException('채팅방 아이디를 입력해주세요.');
    } else if (!target_id) {
      throw new BadRequestException('상대방 아이디를 입력해주세요.');
    }
    const admin: ChatMember = await this.isThisChatMember(room_id, user_id);
    const member: ChatMember = await this.isThisChatMember(room_id, target_id);

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
  ): Promise<boolean> {
    if (!room_id) {
      throw new BadRequestException('채팅방 아이디를 입력해주세요.');
    } else if (!target_id) {
      throw new BadRequestException('상대방 아이디를 입력해주세요.');
    } else if (!mute_time) {
      throw new BadRequestException('음소거 시간을 입력해주세요.');
    }
    const admin: ChatMember = await this.isThisChatMember(room_id, user_id);
    const member: ChatMember = await this.isThisChatMember(room_id, target_id);

    if (admin.permission > member.permission) {
      member.mute = mute_time;
      this.chatMemberRepository.save(member);
      return true;
    }
    return false;
  }

  async banMember(room_id: number, user_id: string, target_id: string) {
    const admin: ChatMember = await this.isThisChatMember(room_id, user_id);
    const member: ChatMember = await this.isThisChatMember(room_id, target_id);

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
    const block_list: BlockList = this.blockRepository.create({
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
    const member: ChatMember = await this.isThisChatMember(room_id, user_id);
    if (member.permission === 2) {
      return true;
    }
    return false;
  }

  async isChatMember(user_id: string) {
    if (!user_id) {
      throw new BadRequestException('유저아이디를 입력해주세요.');
    }
    const member = await this.chatMemberRepository.findOneBy({
      userId: user_id,
    });
    if (!member) {
      throw new NotFoundException(`${user_id}는 채팅방 멤버가 아닙니다.`);
    }
    return member;
  }

  async isThisChatMember(room_id: number, user_id: string) {
    if (!room_id) {
      throw new BadRequestException('채팅방 아이디를 입력해주세요.');
    } else if (!user_id) {
      throw new BadRequestException('유저아이디를 입력해주세요.');
    }
    const member = await this.chatMemberRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (!member) {
      throw new NotFoundException(`${user_id}는 채팅방 멤버가 아닙니다.`);
    }
    return member;
  }

  async getRoom(room_id: number): Promise<ChatRoom> {
    if (!room_id) {
      throw new BadRequestException('room id를 입력해주세요.');
    }
    const room: ChatRoom = await this.chatRoomRepository.findOneBy({
      id: room_id,
    });
    if (!room) {
      throw new NotFoundException('해당 채팅방은 존재하지 않습니다.');
    }
    if (room.current_nums >= room.max_nums) {
      throw new ConflictException('해당 채팅방 인원이 꽉 찼습니다.');
    }
    return room;
  }

  async isRoom(room_id: number, user_id: string): Promise<ChatRoom> {
    const room: ChatRoom = await this.chatRoomRepository.findOneBy({
      id: room_id,
    });
    const ban = await this.chatBanRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (!room) {
      throw new NotFoundException('해당 채팅방은 존재하지 않습니다.');
    }
    if (ban) {
      throw new ConflictException('해당 채팅방에 입장하실 수 없습니다.');
    }
    if (room.current_nums >= room.max_nums) {
      throw new ConflictException('해당 채팅방 인원이 꽉 찼습니다.');
    }
    return room;
  }

  async checkChatRoomPw(
    room_id: number,
    userDto: PartialRoomDto
  ): Promise<boolean> {
    const room: ChatRoom = await this.getRoom(room_id);
    if (
      room &&
      room.is_password === true &&
      (await bcrypt.compare(userDto.password, room.password))
    ) {
      return true;
    }
    return false;
  }

  async updateChatRoomPw(
    room_id: number,
    userDto?: PartialRoomDto
  ): Promise<void> {
    const room: ChatRoom = await this.chatRoomRepository.findOneBy({
      id: room_id,
    });
    if (!room) {
      throw new NotFoundException('해당 채팅방은 존재하지 않습니다.');
    }
    if (userDto && userDto.password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userDto.password, salt);
      room.password = hashedPassword;
      room.is_password = true;
    } else {
      room.password = null;
      room.is_password = false;
    }
    await this.chatRoomRepository.save(room);
  }

  //초대 검색할 때, 채팅방에 있는 사람 제외하고, 차단 유저 제외하고 비슷한 닉네임 다 조회.
  async inviteChatRoom(user_nickname: string, user_id: string): Promise<any> {
    if (!user_id) {
      throw new BadRequestException('아이디를 제대로 입력해주세요.');
    } else if (!user_nickname) {
      throw new BadRequestException('닉네임을 제대로 입력해주세요.');
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
  async searchUser(user_id: string, user_nickname: string): Promise<any> {
    if (!user_id) {
      throw new BadRequestException('유저아이디를 올바르게 업력해주세요');
    } else if (!user_nickname) {
      throw new BadRequestException('유저닉네임을 제대로 입력해주세요.');
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

  async getBlockList(user_id: string): Promise<any> {
    if (!user_id) {
      throw new BadRequestException('유저아이디를 올바르게 업력해주세요');
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
}
