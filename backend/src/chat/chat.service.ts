import {Injectable, NotFoundException} from '@nestjs/common';
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
    private userRepository: UserRepository
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
        owner: element.chatmembers[0].user.user_id,
      };
      room_list.push(temp);
    });
    // console.log(room_list);
    return room_list;
  }

  async getRoomMembers(room_id: number) {
    const room_members = {
      owner: [], // permission = 2
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
        room_members.owner.push(userinfo);
      }
    });
    // console.log(room_members);
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
      console.log(
        `${roomDto.user_id} is already owner ${already[0].chatroomId}`
      );
      return;
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
}
