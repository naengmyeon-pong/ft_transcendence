import * as HTTP_STATUS from 'http-status';

import apiManager from '@/api/apiManager';

export const isValidUserToken = async (): Promise<boolean> => {
  try {
    const response = await apiManager.get('/user/validation-token');
    if (response.status === HTTP_STATUS.OK) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const isValidSignupToken = async (): Promise<boolean> => {
  try {
    const response = await apiManager.get('/signup/validation-token');
    if (response.status === HTTP_STATUS.OK) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
