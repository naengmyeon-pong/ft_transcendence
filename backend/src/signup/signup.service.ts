import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';
import {UserRepository} from 'src/user/user.repository';
import {IsUserAuthRepository} from './signup.repository';
import {IsUserAuth} from './signup.entity';
import {JwtService} from '@nestjs/jwt';
import {Payload} from 'src/user/payload';
import {UserDto} from 'src/user/dto/user.dto';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import {DataSource, QueryRunner} from 'typeorm';
@Injectable()
export class SignUpService {
  constructor(
    private userRepository: UserRepository,
    private userAuthRepository: IsUserAuthRepository,
    private jwtService: JwtService,
    private dataSource: DataSource
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const api_token_uri = process.env.INTRA_TOKEN_URI;
    const grant_type = 'authorization_code';
    const client_uid = process.env.INTRA_API_UID;
    const client_secret = process.env.INTRA_API_SECRET;
    const redirect_uri = process.env.INTRA_API_REDIRECT_URI;

    const tokenUrl = `${api_token_uri}?grant_type=${grant_type}&client_id=${client_uid}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`;
    try {
      const response = await axios({
        method: 'post',
        url: tokenUrl,
      });
      return response.data.access_token;
    } catch (error) {
      throw new BadRequestException(
        '유효하지 않은 로그인 정보입니다. 다시 시도해주세요.'
      );
    }
  }

  async getUserData(code: string): Promise<string> {
    if (!code) {
      throw new BadRequestException('code가 비어있습니다.');
    }
    const api_uri = process.env.INTRA_API_URI;
    const accessToken = await this.getAccessToken(code);

    const response = await axios.get(api_uri, {
      headers: {Authorization: `Bearer ${accessToken}`},
    });
    const user = await this.userRepository.findOneBy({
      user_id: response.data.login,
    });
    if (!user) {
      const query_runner: QueryRunner = this.dataSource.createQueryRunner();
      await query_runner.connect();
      await query_runner.startTransaction();
      try {
        const userAuth: IsUserAuth = this.userAuthRepository.create({
          user_id: response.data.login,
        });
        await query_runner.manager.getRepository(IsUserAuth).save(userAuth);
        const payload: Payload = {
          user_id: userAuth.user_id,
        };
        const signupJwt = this.jwtService.sign(payload);
        const ret = {
          user_id: response.data.login,
          user_image: response.data.image.link,
          is_already_signup: false,
          signup_jwt: signupJwt,
        };
        await query_runner.commitTransaction();
        return JSON.stringify(ret);
      } catch (error) {
        await query_runner.rollbackTransaction();
        throw new InternalServerErrorException('서버에러가 발생했습니다.');
      } finally {
        await query_runner.release();
      }
    } else {
      const userAuth: IsUserAuth = await this.userAuthRepository.findOneBy({
        user_id: response.data.login,
      });
      const payload: Payload = {
        user_id: userAuth.user_id,
      };
      const signupJwt = this.jwtService.sign(payload);
      const ret = {
        user_id: response.data.login,
        user_image: response.data.image.link,
        is_already_signup: true,
        signup_jwt: signupJwt,
      };
      return JSON.stringify(ret);
    }
  }

  async checkUserNickname(
    userID: string,
    userNickname: string
  ): Promise<boolean> {
    if (!userID || !userNickname) {
      throw new BadRequestException('아이디와 닉네임을 입력해주세요.');
    }
    const userSignUpAuth = await this.userAuthRepository.findOneBy({
      user_id: userID,
    });

    if (userSignUpAuth) {
      const existNickname = await this.userRepository.findOneBy({
        user_nickname: userNickname,
      });
      if (!existNickname) {
        console.log('You can use it');
        userSignUpAuth.is_nickname_same = true;
        await this.userAuthRepository.save(userSignUpAuth);
        return true;
      }
      userSignUpAuth.is_nickname_same = false;
      await this.userAuthRepository.save(userSignUpAuth);
      return false;
    }
    throw new UnauthorizedException('올바른 페이지를 통해 가입해주세요.');
  }

  async create(userDto: UserDto, file: Express.Multer.File): Promise<void> {
    const {user_id, user_pw, user_nickname, user_image} = userDto;
    if (!user_id) {
      throw new BadRequestException('아이디를 입력해주세요.');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user_pw, salt);
    const userSignUpAuth = await this.userAuthRepository.findOneBy({user_id});
    if (!userSignUpAuth || userSignUpAuth.is_nickname_same === false) {
      if (file) {
        fs.unlink(file.path, err => {
          if (err) throw new InternalServerErrorException();
        });
      }
      throw new UnauthorizedException('올바른 페이지를 통해 가입해주세요.');
    }

    // MEMO: 42이미지, 서버에서 저장하는 이미지가 따로 존재하므로 서버 주소를 붙여야 할듯 싶습니다
    const user = this.userRepository.create({
      user_id,
      user_pw: hashedPassword,
      user_nickname,
      user_image: file
        ? `${process.env.NEXT_PUBLIC_BACKEND_SERVER}` + file.path.substr(11)
        : `${process.env.NEXT_PUBLIC_BACKEND_SERVER}/images/logo.jpeg`,
    });
    await this.userRepository.save(user);
  }

  async changePW(user_id: string, user_pw: string): Promise<void> {
    if (!user_id) {
      throw new BadRequestException('아이디를 입력해주세요.');
    } else if (!user_pw) {
      throw new BadRequestException('비밀번호를 입력해주세요.');
    }
    const user = await this.userRepository.findOneBy({user_id});
    if (user) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user_pw, salt);
      user.user_pw = hashedPassword;
      await this.userRepository.save(user);
    } else {
      throw new NotFoundException(`${user_id}는 유저가 아닙니다.`);
    }
  }
}
