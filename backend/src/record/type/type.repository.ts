import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Type} from './type.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class TypeRepository extends Repository<Type> {
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>
  ) {
    super(
      typeRepository.target,
      typeRepository.manager,
      typeRepository.queryRunner
    );
  }
}
