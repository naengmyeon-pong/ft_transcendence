import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";


@Entity('users')
// @Unique(["user_id", "user_nickname"]) // when user_id and user_nickname both same. not adjust each one.
export class User {
  @PrimaryGeneratedColumn()
  id : number;

  @Column({unique: true}) //each column unique check.
  user_id : string;
  
  @Column()
  user_pw : string;
  
  @Column({unique: true})
  user_nickname : string;

  @Column({nullable: true})
  memo? : string;

  // @CreateDateColumn()

  // @UpdateDateColumn()
}