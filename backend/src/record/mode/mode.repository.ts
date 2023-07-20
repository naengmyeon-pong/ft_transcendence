import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {Mode} from './mode.entity';

@Injectable()
export class ModeRepository extends Repository<Mode> {
  constructor(
    @InjectRepository(Mode)
    private readonly modeRepository: Repository<Mode>
  ) {
    super(
      modeRepository.target,
      modeRepository.manager,
      modeRepository.queryRunner
    );
  }
}
