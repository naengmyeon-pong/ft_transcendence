import {User} from 'src/user/user.entitiy';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
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

  @Column()
  mute: Date;

  @ManyToOne(() => ChatRoom, chatroom => chatroom.chatmembers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  chatroom: ChatRoom;

  @ManyToOne(() => User, user => user.chatmembers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}

@Entity('chatBan')
export class ChatBan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, chatroom => chatroom.chatbans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  chatroom: ChatRoom;

  @ManyToOne(() => User, user => user.chatbans, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
