import {atom} from 'recoil';
import {recoilPersist} from 'recoil-persist';
import {ProfileImage} from '@/types/ProfileImage';

const sessionStorage =
  typeof window !== 'undefined' ? window.sessionStorage : undefined;

const {persistAtom} = recoilPersist({
  key: 'profile-image-persist',
  storage: sessionStorage,
});

export const profileImageState = atom<ProfileImage>({
  key: 'profileImage',
  default: {
    uploadFile: null,
    userId: '',
  },
  effects_UNSTABLE: [persistAtom],
});
