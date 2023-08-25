import {atom} from 'recoil';
import {recoilPersist} from 'recoil-persist';
import {LoginStateType} from '@/types/LoginState';

const sessionStorage =
  typeof window !== 'undefined' ? window.sessionStorage : undefined;

const {persistAtom} = recoilPersist({
  key: 'oauth-login-persist',
  storage: sessionStorage,
});

export const loginState = atom<LoginStateType>({
  key: 'oauthLogin',
  default: {
    isOAuthLogin: false,
    is2faEnabled: false,
  },
  effects_UNSTABLE: [persistAtom],
});
