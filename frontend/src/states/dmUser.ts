import {DmListData, UserType} from '@/types/UserContext';
import {atom} from 'recoil';

export const dmUserInfo = atom<UserType | null>({
  key: 'dmUserInfo',
  default: null,
});

export const dmList = atom<DmListData[]>({
  key: 'dmList',
  default: [],
});
