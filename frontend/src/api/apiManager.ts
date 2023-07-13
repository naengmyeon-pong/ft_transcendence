import axios from 'axios';

const apiManager = axios.create({
  baseURL: `https://${process.env.REACT_APP_AWS_BACKEND_SERVER}`,
  timeout: 3000,
});

apiManager.interceptors.request.use(
  config => {
    const localStorageToken = localStorage.getItem('accessToken');
    const jwtToken =
      localStorageToken === null ? '' : `Bearer ${localStorageToken}`;
    config.headers['authorization'] = jwtToken;
    return config;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default apiManager;
