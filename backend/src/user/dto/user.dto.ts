import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class userDto {
  @IsNotEmpty()
  @IsString()
  user_id : string;
  
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(15)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message : 'password only accepts english and number'
  })
  user_pw : string;
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  user_nickname : string;

  user_image : string;

  second_auth : boolean;
}