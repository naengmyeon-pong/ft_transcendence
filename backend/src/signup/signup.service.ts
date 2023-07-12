import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { User } from 'src/user/user.entitiy';
import { Repository } from 'typeorm';

@Injectable()
export class SignupService {
  // constructor(
  //   @InjectRepository(User)
  //   private userRepository : Repository<User>
  // ) {}

  async getAccessToken(code: string): Promise<string> {
    const api_token_uri = process.env.INTRA_TOKEN_URI;
    const grant_type = 'authorization_code';
    const client_uid = process.env.INTRA_API_UID;
    const client_secret = process.env.INTRA_API_SECRET;
    const redirect_uri = process.env.INTRA_API_REDIRECT_URI;
    const tokenUrl = api_token_uri + '?grant_type=' + grant_type + '&client_id=' + client_uid + '&client_secret=' + client_secret + '&code=' + code + '&redirect_uri=' + redirect_uri;

    const response = await axios({
      method: 'post',
      url: tokenUrl
    })

    return response.data.access_token;
  }

  async getUserData(code: string) : Promise<string> {
    const api_uri = process.env.INTRA_API_URI;
    const accessToken = await this.getAccessToken(code);

    const response = await axios.get(api_uri,{
      headers: {Authorization: `Bearer ${accessToken}`}
    })
    try {
      const ret = {
      "user_id" : response.data.login,
      "user_image" : response.data.image.link
      };
      return JSON.stringify(ret);
    } catch (error) {
      console.log("error", error);
    }
  }

}
