import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RoomDto {
  @IsNotEmpty()
  @IsString()
  room_name: string;

  @IsNotEmpty()
  @IsNumber()
  max_nums: number;

  @IsNotEmpty()
  @IsBoolean()
  is_public: boolean;

  @IsNotEmpty()
  @IsBoolean()
  is_password: boolean;

  @IsNumber()
  @MinLength(4)
  @MaxLength(20)
  password?: number = null;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}
