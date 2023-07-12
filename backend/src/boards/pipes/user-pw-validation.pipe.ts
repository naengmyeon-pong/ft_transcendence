import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class userPwValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value.length > 10) {
      throw new BadRequestException(`${value} is too long pw.`)
    }
    return value;
  }
}