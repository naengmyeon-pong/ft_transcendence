import {BlockList, ChatBan, ChatMember, FriendList} from 'src/chat/chat.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('users')
export class User {
  // @PrimaryGeneratedColumn()
  // id: number;

  @PrimaryColumn()
  user_id: string;

  @Column()
  user_pw: string;

  @Column({unique: true})
  user_nickname: string;

  @Column()
  user_image: string;

  @Column({default: false})
  is_2fa_enabled: boolean;

  @OneToMany(() => ChatMember, chatmember => chatmember.user)
  chatmembers: ChatMember[];

  @OneToMany(() => ChatBan, chatban => chatban.user)
  chatbans: ChatBan[];

  @OneToMany(() => BlockList, blocklist => blocklist.blockUser)
  blocklist: BlockList[];

  @OneToMany(() => FriendList, friendlist => friendlist.FriendUser)
  friend: FriendList[];

  @Column({default: 1000})
  rank_score: number;

  @Column({nullable: true})
  two_factor_auth_secret: string;
}
