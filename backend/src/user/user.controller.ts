import {
  Get,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Patch,
  Request,
  ValidationPipe,
  UseGuards,
  UploadedFile,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiTags, ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';

import {User} from './user.entitiy';
import {UserDto} from './dto/user.dto';
import {UserAuthDto} from './dto/userAuth.dto';
import {UserService} from './user.service';
import {UpdateUserDto} from './dto/update-user.dto';
import {OAuthUser} from '@/types/user/oauth';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Request() req: any): Promise<Partial<User>> {
    return this.userService.getUser(req.user.user_id);
  }

  @Delete('/delete')
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
  @UseGuards(AuthGuard('jwt'))
  remove(@Request() req: any): Promise<void> {
    return this.userService.remove(req.user.user_id);
  }

  @Post('/changePw')
  @UseGuards(AuthGuard('jwt'))
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
  changeUserPw(
    @Request() req: any,
    @Body(ValidationPipe) userDto: UpdateUserDto
  ): Promise<void> {
    return this.userService.changePW(req.user.user_id, userDto);
  }

  @Post('/signin')
  async signIn(@Body() userAuthDto: UserAuthDto): Promise<string | number> {
    return await this.userService.signIn(userAuthDto);
  }

  @Get('/oauth')
  async getUserData(@Query('code') code: string): Promise<string | OAuthUser> {
    return await this.userService.getOAuthUser(code);
  }

  // req.user 를 그대로 반환했을 때, password까지 가는중. 수정해야할듯.
  @Get('/user-info')
  @UseGuards(AuthGuard('jwt'))
  getUserInfo(@Request() req): Promise<string> {
    return req.user;
  }

  @Get('/validation-token')
  @UseGuards(AuthGuard('jwt'))
  validateJwtToken(): boolean {
    return true;
  }

  @Patch('/update')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('user_image'))
  @ApiOperation({
    summary: '사용자 정보 업데이트 API',
    description: '사용자 정보를 업데이트한다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보가 정상적으로 업데이트된 경우',
  })
  @ApiResponse({
    status: 404,
    description: '유저 정보가 존재하지 않는 경우',
  })
  updateUser(
    @Body() user: UpdateUserDto,
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<void> {
    return this.userService.updateUser(user, file, req.user.user_id);
  }

  @Get('/nickname')
  @UseGuards(AuthGuard('jwt'))
  async checkUserNickname(
    @Query('user_id') userID: string,
    @Query('nickname') nickname: string
  ): Promise<boolean> {
    return await this.userService.checkUserNickname(userID, nickname);
  }
}
