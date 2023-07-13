import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Redirect, Req, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entitiy';
import { ApiTags } from '@nestjs/swagger';
import { userDto } from './dto/user.dto';
import { userAuthDto } from './dto/userAuth.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {};

  @Post('/signup')
  signup(@Body(ValidationPipe) userDto: userDto) : Promise<void> {
    return this.userService.create(userDto);
  }

  @Delete('/delete:user_id')
  remove(@Param('user_id') user_id : string) : Promise<void> {
    return this.userService.remove(user_id);
  }

  @Post('/changePw')
  updateUserPw(
    @Body(ValidationPipe) userAuthDto : userAuthDto
    ) : Promise<User> {
      return this.userService.updateUserPw(userAuthDto);
  }

  @Post('/signin')
  signIn(@Body() userAuthDto : userAuthDto) : Promise<string> {
    return this.userService.signIn(userAuthDto);
  } 
}
