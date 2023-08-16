import {atom} from 'recoil';

export const passwordResetState = atom<boolean>({
  key: 'passwordResetState',
  default: false,
});
