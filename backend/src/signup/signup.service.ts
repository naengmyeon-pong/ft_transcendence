import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import {InjectRepository} from '@nestjs/typeorm';
import {UserRepository} from 'src/user/user.repository';
import {isUserAuthRepository} from './signup.repository';
import {isUserAuth} from './signup.entity';
import {JwtService} from '@nestjs/jwt';
import {Payload} from 'src/user/payload';

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private userAuthRepository: isUserAuthRepository,
    private jwtService: JwtService
  ) {}

  async getAccessToken(code: string): Promise<string> {
    const api_token_uri = process.env.INTRA_TOKEN_URI;
    const grant_type = 'authorization_code';
    const client_uid = process.env.INTRA_API_UID;
    const client_secret = process.env.INTRA_API_SECRET;
    const redirect_uri = process.env.INTRA_API_REDIRECT_URI;

    const tokenUrl = `${api_token_uri}?grant_type=${grant_type}&client_id=${client_uid}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`;
    const response = await axios({
      method: 'post',
      url: tokenUrl,
    });

    if (!response) {
      throw new BadRequestException(
        'code is not validated! please check code!'
      );
    }
    return response.data.access_token;
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
        const userAuth: isUserAuth = this.userAuthRepository.create({
          user_id: response.data.login,
        });
        await this.userAuthRepository.save(userAuth);

        const payload: Payload = {
          user_id: userAuth.user_id,
        };
        const signupJwt = this.jwtService.sign(payload, {
          secret: 'Intra42',
          expiresIn: 60 * 2,
        });
        const ret = {
          user_id: response.data.login,
          user_image: response.data.image.link,
          is_already_signup: false,
          signupJwt: signupJwt,
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
        signupJwt: undefined,
      };
      return JSON.stringify(ret);
    }
  }

  async checkUserNickname(
    user_id: string,
    user_nickname: string
  ): Promise<boolean> {
    const userSignUpAuth = await this.userAuthRepository.findOneBy({user_id});

    if (userSignUpAuth) {
      const existNickname = await this.userRepository.findOneBy({
        user_nickname,
      });
      if (!existNickname) {
        console.log('You can use it');
        userSignUpAuth.isNickSame = true;
        await this.userAuthRepository.save(userSignUpAuth);
        return true;
      }
      userSignUpAuth.isNickSame = false;
      await this.userAuthRepository.save(userSignUpAuth);
      return false;
    }
    throw new UnauthorizedException(
      'Please auth through our main signup page.'
    );
  }
}
