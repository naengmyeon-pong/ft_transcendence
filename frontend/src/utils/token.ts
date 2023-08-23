import * as jsonwebtoken from 'jsonwebtoken';

export const getJwtToken = (): string | null => {
  const jwtToken: string | null = sessionStorage.getItem('accessToken');
  if (jwtToken === null) {
    return null;
  }
  return jwtToken;
};

export const getExpirationTimeInMilliseconds = () => {
  const token = getJwtToken();
  if (token === null) {
    return 0;
  }
  const decodedToken = jsonwebtoken.decode(token);
  if (decodedToken === null) {
    return 0;
  }
  const expirationTime = decodedToken.exp;
  return expirationTime * 1000;
};

export const getRemainedTime = (start: number): string => {
  const currentTime = Date.now();
  const remainingTime = Math.max(0, start - currentTime);
  const minutes = Math.floor(remainingTime / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
  return formattedTime;
};

export const isTokenExpired = (expirationTime: number): boolean => {
  const currentTime = Date.now();
  if (expirationTime <= currentTime) {
    return true;
  }
  return false;
};
