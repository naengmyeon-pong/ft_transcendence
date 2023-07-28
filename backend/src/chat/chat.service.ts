import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChatMemberRepository,
  ChatRoomRepository,
  SocketRepository,
} from './chat.repository';
import {UserRepository} from 'src/user/user.repository';
import {RoomDto} from './dto/room.dto';

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
    private socketRepository: SocketRepository,
    private socketId: SocketRepository,
    private userRepository: UserRepository
  ) {}

  async getRoomList() {
    const room_list = [];
    const chatrooms = await this.chatRoomRepository
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

    const room = this.chatRoomRepository.create({
      name: roomDto.room_name,
      current_nums: 1,
      max_nums: roomDto.max_nums,
      is_public: roomDto.is_public,
      is_password: roomDto.is_password,
      password: roomDto.password,
    });
    await this.chatRoomRepository.save(room);
    const room_member = this.chatMemberRepository.create({
      permission: 2,
      mute: null,
      chatroom: room,
      user: user,
    });
    await this.chatMemberRepository.save(room_member);
    return room;
  }

  async joinRoom(room_id: number, user_id: string) {
    if (!room_id || !user_id) {
      throw new BadRequestException('empty parameter.');
    }
    const user = await this.getUser(user_id);
    const member = await this.chatMemberRepository.findOneBy({
      chatroomId: room_id,
      userId: user_id,
    });
    if (member && member.permission === 2) {
      // 이 user가 방의 owner이면 방 만들 때 이미 member로 추가 되었기 때문에 skip 하고 socket에서 join만 할 수 있도록.
      return;
    } else if (member) {
      // owner가 아닌 유저가 이미 있으면 postman 같이 잘못된 요청이므로 에러 발생
      throw new ConflictException(`${user_id} already chatmember.`);
    }

    const room = await this.getRoom(room_id);
    if (room.current_nums >= room.max_nums) {
      // 새로운 유저라서 방에 추가해줘야 하는데, 방 인원이 꽉 찼을 경우
      throw new ConflictException('sorry, room is full!');
    }
    room.current_nums += 1;
    await this.chatRoomRepository.save(room);
    const new_member = this.chatMemberRepository.create({
      permission: 0,
      mute: null,
      chatroom: room,
      userId: user_id,
    });
    await this.chatMemberRepository.save(new_member);
  }

  async leaveRoom(room_id: number, user_id: string) {
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
      //owner 일 때 방 전체가 터지게.
      const check_del = await this.chatRoomRepository.delete({id: room_id});
      console.log('check_del :', check_del.affected);
      return member;
    } else {
      await this.chatMemberRepository.delete({
        userId: member.userId,
        chatroomId: room_id,
      });
      room.current_nums -= 1;
      await this.chatRoomRepository.save(room);
    }
    return member;
  }

  async socketConnection(socket_id: string, user_id: string) {
    if (!socket_id || !user_id) {
      throw new BadRequestException('empty parameter.');
    }
    const socket = this.socketRepository.create({
      user_id,
      socket_id,
    });
    await this.socketRepository.save(socket);
  }

  async socketDisconnection(socket_id: string) {
    if (!socket_id) {
      throw new BadRequestException('empty parameter.');
    }
    const socket = await this.socketRepository.delete({socket_id: socket_id});
    if (socket.affected === 0) {
      console.log('socket_id :', socket_id);
      // throw new NotFoundException(`${socket_id} is not a vlidate socket.`);
    }
  }

  async deleteRoom(room_id: number) {
    const room = await this.getRoom(room_id);
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
}
