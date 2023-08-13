import {ApiProperty} from '@nestjs/swagger';

export class TwoFactorAuthCodeDto {
  @ApiProperty({
    example: 'my_id',
    description: '인증하려는 유저의 사이트 ID',
    required: true,
  })
  user_id: string;
  @ApiProperty({
    example: '!1234qwer',
    description: '인증하려는 유저의 사이트 id',
    required: true,
  })
  user_pw: string;
  @ApiProperty({
    example: '123456',
    description: '인증용 구글 OTP 6자리',
    required: true,
  })
  code: string;
}
