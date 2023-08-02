import {User} from 'src/user/user.entitiy';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('chatRoom')
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  current_nums: number;

  @Column()
  max_nums: number;

  @Column()
  is_public: boolean;

  @Column()
  is_password: boolean;

  @Column({nullable: true})
  password: number;

  @OneToMany(() => ChatMember, chatmember => chatmember.chatroom)
  chatmembers: ChatMember[];

  @OneToMany(() => ChatBan, chatban => chatban.chatroom)
  chatbans: ChatBan[];
}

@Entity('chatMember')
export class ChatMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permission: number;

  @Column({nullable: true})
  mute: string;

  @Column()
  chatroomId: number;

  @Column()
  userId: string;

  @ManyToOne(() => ChatRoom, chatroom => chatroom.chatmembers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  chatroom: ChatRoom;

  @ManyToOne(() => User, user => user.chatmembers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;
}

@Entity('chatBan')
export class ChatBan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatroomId: number;

  @Column()
  userId: string;

  @ManyToOne(() => ChatRoom, chatroom => chatroom.chatbans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  chatroom: ChatRoom;

  @ManyToOne(() => User, user => user.chatbans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;
}

@Entity('socketId')
export class SocketId {
  @PrimaryColumn()
  user_id: string;

  @Column()
  socket_id: string;

  @OneToOne(() => User, user => user.socket_id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'user_id'})
  user: User;
}
