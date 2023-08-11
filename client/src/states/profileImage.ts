import {atom} from 'recoil';
import {recoilPersist} from 'recoil-persist';
import {ProfileImage} from '@/types/ProfileImage';

const {persistAtom} = recoilPersist();

export const profileImageState = atom<ProfileImage>({
  key: 'profileImage',
  default: {
    uploadFile: null,
    userId: '',
  },
  effects_UNSTABLE: [persistAtom],
});
