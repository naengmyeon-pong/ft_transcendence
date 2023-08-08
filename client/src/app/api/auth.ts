import apiManager from '@/app/api/apiManager';

export const getJwtToken = (): string => {
  const jwtToken: string | null = sessionStorage.getItem('accessToken');
  if (jwtToken === null) {
    return '';
  }
  return jwtToken;
};

export const isValidJwtToken = async (): Promise<boolean> => {
  const jwtToken = getJwtToken();
  if (jwtToken === '') {
    return false;
  }
  try {
    const response = await apiManager.get('/user/validation-token');
    console.log(response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
