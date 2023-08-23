import {atom} from 'recoil';
import {recoilPersist} from 'recoil-persist';

const sessionStorage =
  typeof window !== 'undefined' ? window.sessionStorage : undefined;

const {persistAtom} = recoilPersist({
  key: 'password-reset',
  storage: sessionStorage,
});

export const passwordResetState = atom<boolean>({
  key: 'password-reset',
  default: false,
  effects_UNSTABLE: [persistAtom],
});
