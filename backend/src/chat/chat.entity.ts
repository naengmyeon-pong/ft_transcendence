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

// @Entity('socketId')
// export class SocketId {
//   @PrimaryColumn()
//   user_id: string;

//   @Column()
//   socket_id: string;

//   @OneToOne(() => User, user => user.socket_id, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({name: 'user_id'})
//   user: User;
// }

@Entity('blockList')
export class BlockList {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  blockId: string;

  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => User, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'blockId'})
  blockUser: User;
}

// @Entity('directmessage')
// export class DirectMessage {
//   @PrimaryColumn()
//   userId: string;

//   @PrimaryColumn()
//   friendId: string;

//   @ManyToOne(() => User, {onDelete: 'CASCADE'})
//   @JoinColumn({name: 'userId'})
//   user: User;

//   @ManyToOne(() => User, {onDelete: 'CASCADE'})
//   @JoinColumn({name: 'friendId'})
//   friendkUser: User;

//   @BeforeInsert()
//   sortIds() {
//     // 데이터베이스에 삽입하기 전에 id와 friend_id 값을 정렬
//     const sortedIds = [this.userId, this.friendId].sort();
//     this.userId = sortedIds[0];
//     this.friendId = sortedIds[1];
//   }
// }
