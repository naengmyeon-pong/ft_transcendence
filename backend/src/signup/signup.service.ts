import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class SignupService {

  async getAccessToken(code: string): Promise<string> {
    const api_url = 'https://api.intra.42.fr/oauth/token';
    const grant_type = 'authorization_code';
    const client_uid = process.env.INTRA_API_UID;
    const client_secret = process.env.INTRA_API_SECRET;
    const redirect_uri = 'http://localhost:3001/signup/42api/oauth_ok';
    const tokenUrl = api_url + '?grant_type=' + grant_type + '&client_id=' + client_uid + '&client_secret=' + client_secret + '&code=' + code + '&redirect_uri=' + redirect_uri;

    const accessToken = await fetch(tokenUrl, {method: 'post'})
    .then(res => res.json())
    .then(api_data => api_data.accessToken)
    .catch(error => {
      throw new ConflictException("Can't get Access Token")
    })
    return accessToken;
  }

  async getUserData(accessToken: Promise<string>) : Promise<string> {
    const api_uri = 'https://api.intra.42.fr/v2/me';

    const UserData = await accessToken
    .then(Token => console.log(Token))
    .then(Token =>
      fetch(api_uri, {
      method: 'get',
      headers: {Authentication: `Bearer ${Token}`}
    })).then(res => res.json())
    .then(res => JSON.stringify(res))
    .catch(error => {
      throw new ConflictException("Can't get Access Token")
    })
    console.log(UserData);
    return UserData;
  }
}
