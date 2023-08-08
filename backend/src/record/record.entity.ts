import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Mode} from './mode/mode.entity';
import {Type} from './type/type.entity';

@Entity('game_record')
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  winner_id: string;

  @Column()
  loser_id: string;

  @Column({default: 0})
  winner_score: number;

  @Column({default: 0})
  loser_score: number;

  @Column({default: false})
  is_forfeit: boolean;

  @ManyToOne(() => Mode, mode_id => mode_id.records, {eager: false})
  game_mode: number;

  @ManyToOne(() => Type, type_id => type_id.records, {eager: false})
  game_type: number;

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  datetime: Date;
}