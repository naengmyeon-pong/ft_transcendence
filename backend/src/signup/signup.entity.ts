import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity('userAuth')
export class isUserAuth {
  @PrimaryColumn()
  user_id: string;

  @Column({default: false})
  isAuth: boolean;
}
