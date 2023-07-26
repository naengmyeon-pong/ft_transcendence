import {ChatBan, ChatMember} from 'src/chat/chat.entity';
import {Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';

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

  @Column('boolean', {default: false})
  is_2fa_enabled: boolean;

  @OneToMany(() => ChatMember, chatmember => chatmember.user)
  chatmembers: ChatMember[];

  @OneToMany(() => ChatBan, chatban => chatban.user)
  chatbans: ChatBan[];
}
