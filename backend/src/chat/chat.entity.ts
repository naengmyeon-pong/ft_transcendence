import {User} from 'src/user/user.entitiy';
import {
  BeforeInsert,
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
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'chatroomId'})
  chatroom: ChatRoom;

  @ManyToOne(() => User, user => user.chatmembers, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
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
    onUpdate: 'CASCADE',
  })
  chatroom: ChatRoom;

  @ManyToOne(() => User, user => user.chatbans, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;
}

@Entity('blockList')
export class BlockList {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  blockId: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'blockId'})
  blockUser: User;
}

@Entity('directMessage')
export class DirectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  someoneId: string;

  @Column()
  date: Date;

  @Column()
  message: string;

  @Column({nullable: true})
  blockId: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'someoneId'})
  someoneUser: User;
}

@Entity('friendList')
export class FriendList {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  friendId: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name: 'friendId'})
  FriendUser: User;
}
