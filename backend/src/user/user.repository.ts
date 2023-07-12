import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entitiy";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){
      super (userRepository.target, userRepository.manager, userRepository.queryRunner);
  }
  
}