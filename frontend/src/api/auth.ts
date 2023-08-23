import * as HTTP_STATUS from 'http-status';

import apiManager from '@/api/apiManager';

export const isValidJwtToken = async (): Promise<boolean> => {
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
