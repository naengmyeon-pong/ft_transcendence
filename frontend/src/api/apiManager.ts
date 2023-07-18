import axios, {AxiosInstance} from 'axios';

const apiManager: AxiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}`,
  timeout: 3000,
});

apiManager.interceptors.request.use(
  config => {
    const sessionStorageToken = sessionStorage.getItem('accessToken');
    const jwtToken =
      sessionStorageToken === null ? '' : `Bearer ${sessionStorageToken}`;
    config.headers['authorization'] = jwtToken;
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default apiManager;
