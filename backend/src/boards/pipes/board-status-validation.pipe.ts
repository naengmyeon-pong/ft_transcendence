import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { BoardStatus } from "../board-status.enum";

export class BoardStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [
    BoardStatus.PRIVATE,
    BoardStatus.PUBLIC
  ]
 
  transform(value: any) {
    // console.log('value', value);
    // console.log('metadata', metadata);
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} is not status options`);
    }

    return value;
  }

  private isStatusValid(value : any) {
    const index = this.StatusOptions.indexOf(value);
    return index !== -1;
  }

}