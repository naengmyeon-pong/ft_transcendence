import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {isUserAuth} from 'src/signup/signup.entity';

@Injectable()
export class isUserAuthRepository extends Repository<isUserAuth> {
  constructor(
    @InjectRepository(isUserAuth)
    private readonly userAuthRepository: Repository<isUserAuth>
  ) {
    super(
      userAuthRepository.target,
      userAuthRepository.manager,
      userAuthRepository.queryRunner
    );
  }
}
