import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity('userAuth')
export class IsUserAuth {
  @PrimaryColumn()
  user_id: string;

  @Column({default: false})
  is_nickname_same: boolean;
}
