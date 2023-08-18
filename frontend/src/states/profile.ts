import {atom} from 'recoil';
import {Profile} from '@/types/Profile';

export const profileState = atom<Profile>({
  key: 'profile',
  default: {
    user_id: '',
    nickname: '',
    image: '',
    is_2fa_enabled: false,
  },
});
