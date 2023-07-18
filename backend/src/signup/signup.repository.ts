import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {IsUserAuth} from 'src/signup/signup.entity';

@Injectable()
export class IsUserAuthRepository extends Repository<IsUserAuth> {
  constructor(
    @InjectRepository(IsUserAuth)
    private readonly userAuthRepository: Repository<IsUserAuth>
  ) {
    super(
      userAuthRepository.target,
      userAuthRepository.manager,
      userAuthRepository.queryRunner
    );
  }
}
