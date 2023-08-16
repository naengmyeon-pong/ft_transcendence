import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import {InjectRepository} from '@nestjs/typeorm';
import {UserRepository} from 'src/user/user.repository';
import {IsUserAuthRepository} from './signup.repository';
import {IsUserAuth} from './signup.entity';
import {JwtService} from '@nestjs/jwt';
import {Payload} from 'src/user/payload';
import {UserDto} from 'src/user/dto/user.dto';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
@Injectable()
export class SignUpService {
  constructor(
    // @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private userAuthRepository: IsUserAuthRepository,
    private jwtService: JwtService
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
    const api_uri = process.env.INTRA_API_URI;
    const accessToken = await this.getAccessToken(code);

    const response = await axios.get(api_uri, {
      headers: {Authorization: `Bearer ${accessToken}`},
    });
    const user = await this.userRepository.findOneBy({
      user_id: response.data.login,
    });
    if (!user) {
      try {
        const userAuth: IsUserAuth = this.userAuthRepository.create({
          user_id: response.data.login,
        });
        await this.userAuthRepository.save(userAuth);

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
        return JSON.stringify(ret);
      } catch (error) {
        console.log('error', error);
        throw new InternalServerErrorException();
      }
    } else {
      const ret = {
        user_id: response.data.login,
        user_image: response.data.image.link,
        is_already_signup: true,
        signup_jwt: null,
      };
      return JSON.stringify(ret);
    }
  }

  async checkUserNickname(
    userID: string,
    userNickname: string
  ): Promise<boolean> {
    if (!userID || !userNickname) {
      throw new BadRequestException('enter your ID and nickname');
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
    throw new UnauthorizedException(
      'Please auth through our main signup page.'
    );
  }

  // test를 위해 비밀번호 암호화하지 않음.
  async create(userDto: UserDto, file: Express.Multer.File): Promise<void> {
    const {user_id, user_pw, user_nickname, user_image} = userDto;
    if (!user_id) {
      throw new BadRequestException('enter your ID');
    }
    const salt = await bcrypt.genSalt();
    // const hashedPassword = await bcrypt.hash(user_pw, salt);
    const userSignUpAuth = await this.userAuthRepository.findOneBy({user_id});
    if (!userSignUpAuth || userSignUpAuth.is_nickname_same === false) {
      if (!file) {
        fs.unlink(file.path, err => {
          if (err) throw new InternalServerErrorException();
        });
      }
      throw new UnauthorizedException(
        'Please auth through our main signup page.'
      );
    }

    try {
      const user = this.userRepository.create({
        user_id,
        user_pw: user_pw,
        // user_pw: hashedPassword,
        user_nickname,
        user_image: file ? file.path.substr(11) : '/images/logo.jpeg',
      });
      await this.userRepository.save(user);
      await this.userAuthRepository.delete({user_id: user.user_id});
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  // async create(userDto: UserDto, file: Express.Multer.File): Promise<void> {
  //   const {user_id, user_pw, user_nickname, user_image, is_2fa_enabled} =
  //     userDto;
  //   if (!user_id) {
  //     throw new BadRequestException('enter your ID');
  //   }
  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(user_pw, salt);
  //   const userSignUpAuth = await this.userAuthRepository.findOneBy({user_id});
  //   if (!userSignUpAuth || userSignUpAuth.is_nickname_same === false) {
  //     if (!file) {
  //       fs.unlink(file.path, err => {
  //         if (err) throw new InternalServerErrorException();
  //       });
  //     }
  //     throw new UnauthorizedException(
  //       'Please auth through our main signup page.'
  //     );
  //   }

  //   try {
  //     const user = this.userRepository.create({
  //       user_id,
  //       user_pw: hashedPassword,
  //       user_nickname,
  //       user_image: file ? file.path.substr(11) : '/images/logo.jpeg',
  //       is_2fa_enabled,
  //     });
  //     await this.userRepository.save(user);
  //     await this.userAuthRepository.delete({user_id: user.user_id});
  //   } catch (error) {
  //     throw new InternalServerErrorException();
  //   }
  // }
}
