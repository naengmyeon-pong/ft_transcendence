import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,}$/, {
    message: 'password only accepts english and number',
  })
  user_pw: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  user_nickname: string;

  user_image: string;

  is_2fa_enabled: boolean;
}
