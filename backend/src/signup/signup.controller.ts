import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Query,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {SignUpService} from './signup.service';
import {UserDto} from 'src/user/dto/user.dto';
import {UserAuthDto} from '@/user/dto/userAuth.dto';
import {AuthGuard} from '@nestjs/passport';
import {FileInterceptor} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import * as fs from 'fs';

@Controller('signup')
@ApiTags('Auth')
export class SignUpController {
  constructor(private signUpService: SignUpService) {}

  @ApiQuery({
    name: 'code',
    required: true,
    description: '42 API에서 받은 code',
  })
  @Get('/auth')
  @ApiOperation({
    summary: '유저 정보 전달 API',
    description:
      '전달받은 code를 사용해서 42 API에서 받은 유저 정보를 전달한다.',
  })
  @ApiResponse({
    status: 200,
    description: '정상적으로 처리된 경우',
  })
  @ApiResponse({
    status: 409,
    description: '이미 회원가입이 된 유저인 경우',
  })
  @ApiResponse({
    status: 500,
    description: '유저 정보 DB에 저장 중 에러 발생한 경우',
  })
  async getUserData(@Query('code') code: string): Promise<string> {
    return await this.signUpService.getUserData(code);
  }

  // nickname이 없으면 true, 있으면 false
  @Get('/nickname')
  @ApiQuery({
    name: 'user_id',
    required: true,
    description: '유저의 인트라 id',
  })
  @ApiQuery({
    name: 'nickname',
    required: true,
    description: '중복 확인할 닉네임',
  })
  @ApiOperation({
    summary: '닉네임 중복 확인 API',
    description: '전달받은 nickname이 사용 가능한지를 확인한다.',
  })
  @ApiResponse({
    status: 200,
    description: '닉네임이 사용 가능하거나 불가능한 경우',
  })
  @ApiResponse({
    status: 401,
    description: 'user_id가 userAuth 데이터베이스에 존재하지 않는 경우',
  })
  @UseGuards(AuthGuard('signup'))
  async checkUserNickname(
    @Query('user_id') userID: string,
    @Query('nickname') nickname: string
  ): Promise<boolean> {
    return await this.signUpService.checkUserNickname(userID, nickname);
  }

  @Post()
  @UseGuards(AuthGuard('signup'))
  @UseInterceptors(FileInterceptor('user_image'))
  @ApiOperation({
    summary: '유저 정보를 DB에 저장하는 API',
    description:
      'JWT 토큰을 확인한 후 전달받은 body의 유저 정보를 DB에 저장한다.<br />JWT 토큰은 반드시 Bearer 형식으로 전달해야한다.',
  })
  @ApiResponse({
    status: 201,
    description: '유저 정보를 정상적으로 저장한 경우',
  })
  @ApiResponse({
    status: 401,
    description: '유저가 JWT 토큰 없이 접근하는 경우',
  })
  @ApiResponse({
    status: 409,
    description: '회원 가입 정보가 존재하는 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'DB 저장에 실패한 경우',
  })
  async signUp(
    @Body(ValidationPipe) userinfo: UserDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<void> {
    return await this.signUpService.create(userinfo, file);
  }

  @Post('/changePw')
  @UseGuards(AuthGuard('signup'))
  async changePW(
    @Body('user_pw') user_pw: string,
    @Request() req: any
  ): Promise<void> {
    return await this.signUpService.changePW(req.user.user_id, user_pw);
  }

  @Get('/validation-token')
  @UseGuards(AuthGuard('signup'))
  validateJwtToken(): boolean {
    return true;
  }
}
