import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Record} from '../record.entity';

@Entity('game_type')
export class Type {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  type: string;

  @OneToMany(() => Record, records => records.type_id, {eager: true})
  records: Record[];
}
