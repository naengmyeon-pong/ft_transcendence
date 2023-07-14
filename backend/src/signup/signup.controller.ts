import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {SignupService} from './signup.service';
import {UserDto} from 'src/user/dto/user.dto';
import {UserService} from 'src/user/user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('signup')
@ApiTags('Auth')
export class SignupController {
  constructor(
    private signupService: SignupService,
    private userService: UserService
  ) {}

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
    return await this.signupService.getUserData(code);
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
  async checkUserNickname(
    @Query('user_id') user_id: string,
    @Query('nickname') nickname: string
  ): Promise<boolean> {
    return await this.signupService.checkUserNickname(user_id, nickname);
  }

  @Post()
  @ApiOperation({
    summary: '유저 정보를 DB에 저장하는 API',
    description: '전달받은 body의 유저 정보를 DB에 저장한다.',
  })
  @ApiResponse({
    status: 201,
    description: '유저 정보를 정상적으로 저장한 경우',
  })
  @ApiResponse({
    status: 409,
    description: '회원 가입 정보가 존재하는 경우',
  })
  @ApiResponse({
    status: 500,
    description: 'DB 저장에 실패한 경우',
  })
  async signup(@Body(ValidationPipe) userinfo: UserDto): Promise<void> {
    return await this.userService.create(userinfo);
  }
}
