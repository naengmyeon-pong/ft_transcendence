import axios, {AxiosInstance} from 'axios';
import {getJwtToken} from '@/api/auth';

const apiManager: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_SERVER}`,
  timeout: 3000,
});

apiManager.interceptors.request.use(
  config => {
    const jwtToken = getJwtToken();
    config.headers['authorization'] = `Bearer ${jwtToken}`;
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default apiManager;
