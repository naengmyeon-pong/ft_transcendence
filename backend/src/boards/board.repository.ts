import { Injectable, SetMetadata } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Board } from "./board.entitiy";

// @EntityRepository()
@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }
}