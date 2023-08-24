import {atom} from 'recoil';

export const tokenExpiredExit = atom<boolean>({
  key: 'tokenExpiredExit',
  default: false,
});
