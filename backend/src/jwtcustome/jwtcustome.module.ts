import {JwtStrategy} from '@/user/jwt.strategy';
import {User} from '@/user/user.entitiy';
import {UserRepository} from '@/user/user.repository';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: process.env.SIGNIN_JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [JwtStrategy, UserRepository],
  exports: [JwtModule, JwtStrategy],
})
export class JwtcustomeModule {}
