import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {Transform} from 'class-transformer';

export class UserDto {
  @ApiProperty({
    example: 'my_id',
    description: '유저의 인트라 id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({
    example: '!123Qwerty',
    description: '사용할 비밀번호',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  // @MinLength(8)
  // @MaxLength(20)
  // @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,}$/, {
  //   message: 'password only accepts english and number',
  // })
  user_pw: string;

  @ApiProperty({
    example: 'genius',
    description: '사용할 닉네임',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  user_nickname: string;

  @ApiProperty({
    example: 'https://cdn.intra.42.fr/users/1234/test.jpg',
    description: '이미지 주소',
    required: true,
  })
  user_image: string;

  @ApiProperty({
    example: 'false',
    description: '2차 인증 사용 여부',
    required: false,
  })
  @Transform(value => {
    return value.value === 'true' ? true : false;
  })
  is_2fa_enabled: boolean;
}
