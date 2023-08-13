import {
  Get,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Request,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {UserService} from './user.service';
import {User} from './user.entitiy';
import {AuthGuard} from '@nestjs/passport';
import {ApiTags, ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {UserAuthDto} from './dto/userAuth.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Delete('/delete:user_id')
  @ApiQuery({
    name: 'user_id',
    required: true,
    description: '회원 정보 제거할 유저의 id',
  })
  @ApiOperation({
    summary: '회원 정보 삭제 API',
    description: 'user_id에 해당하는 회원 정보를 DB에서 삭제한다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저가 정상적으로 삭제된 경우',
  })
  @ApiResponse({
    status: 404,
    description: '유저 정보가 존재하지 않는 경우',
  })
  remove(@Param('user_id') user_id: string): Promise<void> {
    return this.userService.remove(user_id);
  }

  @Post('/changePw')
  @ApiOperation({
    summary: '비밀번호 변경 API',
    description: '기존 암호를 사용자로부터 전달받은 새로운 암호로 변경한다.',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 정상적으로 변경된 경우',
  })
  @ApiResponse({
    status: 201,
    description: '비밀번호가 정상적으로 변경된 경우',
  })
  @ApiResponse({
    status: 404,
    description: '유저 정보가 존재하지 않는 경우',
  })
  changeUserPw(@Body(ValidationPipe) userAuthDto: UserAuthDto): Promise<User> {
    return this.userService.changePW(userAuthDto);
  }

  @Post('/signin')
  async signIn(@Body() userAuthDto: UserAuthDto): Promise<string | number> {
    return await this.userService.signIn(userAuthDto);
  }

  @Get('/user-info')
  // @UseGuards(AuthGuard('jwt'))
  getUserInfo(@Request() req): Promise<string> {
    return req.user;
  }

  @Get('/validation-token')
  @UseGuards(AuthGuard('jwt'))
  validateJwtToken(): boolean {
    return true;
  }
}
