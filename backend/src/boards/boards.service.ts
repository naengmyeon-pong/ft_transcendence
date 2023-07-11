import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardStatus } from './board-status.enum';
import { v1 as uuid } from 'uuid';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardRepository } from './board.repository';
import { Board } from './board.entitiy';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto) : Promise<Board> {
    const {title, description} = createBoardDto;

    const board = this.boardRepository.create( {
      title,
      description,
      status: BoardStatus.PUBLIC
    })
    await this.boardRepository.save(board);
    return board;
  }

  async getBoardById(id: number) : Promise<Board> {
    const found = await this.boardRepository.findOneBy({id});

    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`)
    }
    return found;
  }



  // private boards: Board[] = [];

  // getAllBoards(): Board[] {
  //   return this.boards;
  // }

  // createBoard(createBoardDto: CreateBoardDto) {
  //   const {title, description} = createBoardDto;

  //   const board: Board = {
  //     id: uuid(),
  //     title: title,
  //     description: description,
  //     status: BoardStatus.PUBLIC
  //   }

  //   this.boards.push(board);
  //   return board;
  // }

  // getBoardById(id: string) : Board {
  //   const found = this.boards.find((board) => board.id === id);

  //   if (!found) {
  //     throw new NotFoundException(`Can't find Board with id ${id}`);
  //   }
  //   return found;
  // }

  // deleteBoard(id: string) : void {
  //   this.getBoardById(id);
  //   this.boards = this.boards.filter((board) => board.id !== id);
  // }

  // updateBoardStatus(id:string, status: BoardStatus) : Board {
  //   const board = this.getBoardById(id);
  //   board.status = status;
  //   return board;
  // }

}
