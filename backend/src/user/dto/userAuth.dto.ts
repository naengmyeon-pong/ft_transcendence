import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class UserAuthDto {
  @ApiProperty({
    example: 'my_id',
    description: '유저의 사이트 id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({
    example: '!123Qwerty',
    description: '유저의 비밀번호',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: 'password only accepts english and number',
  })
  user_pw: string;
}
