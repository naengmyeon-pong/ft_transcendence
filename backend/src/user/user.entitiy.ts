import { Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id : number;

  @Column()
  user_id : string;
  
  @Column()
  user_pw : string;

  @Column({unique: true})
  user_nickname : string;

  @Column()
  user_image : string;

  @Column({default: true})
  second_auth : boolean = false;
}