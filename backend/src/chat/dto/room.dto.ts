import {ApiProperty} from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RoomDto {
  @ApiProperty({
    example: 'room_name',
    description: '생성할 채팅방 이름',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  room_name: string;

  @ApiProperty({
    example: 8,
    description: '생성할 채팅방의 제한 인원',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  max_nums: number;

  @ApiProperty({
    example: true,
    description: '채팅방 공개여부',
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({
    example: false,
    description: '채팅방 비밀번호 설정여부',
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_password: boolean;

  @ApiProperty({
    example: 1234,
    description: '채팅방의 비밀번호',
    required: false,
  })
  @IsNumber()
  @MinLength(4)
  @MaxLength(20)
  password?: number = null;

  @ApiProperty({
    example: 'user_id',
    description: '채팅방을 생성한 유저의 id',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
}
