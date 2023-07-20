import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Record} from '../record.entity';

@Entity('game_mode')
export class Mode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  mode: string;

  @OneToMany(() => Record, records => records.mode_id, {eager: true})
  records: Record[];
}
