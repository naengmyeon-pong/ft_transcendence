import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import {UserService} from './user.service';
import {User} from './user.entitiy';
import {ApiTags} from '@nestjs/swagger';
import {UserDto} from './dto/user.dto';
import {UserAuthDto} from './dto/userAuth.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/signup')
  signup(@Body(ValidationPipe) userDto: UserDto): Promise<void> {
    return this.userService.create(userDto);
  }

  @Delete('/delete:user_id')
  remove(@Param('user_id') user_id: string): Promise<void> {
    return this.userService.remove(user_id);
  }

  @Post('/changePw')
  updateUserPw(@Body(ValidationPipe) userAuthDto: UserAuthDto): Promise<User> {
    return this.userService.updateUserPw(userAuthDto);
  }

  // @Post('/signin')
  // signIn(@Body() userAuthDto: UserAuthDto): Promise<string> {
  //   return this.userService.signIn(userAuthDto);
  // }
}
