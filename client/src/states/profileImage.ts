import {atom} from 'recoil';
import {profileImage} from '@/types/ProfileImage';

export const profileImageState = atom<profileImage>({
  key: 'profileImage',
  default: {
    uploadFile: null,
    userId: '',
  },
});
