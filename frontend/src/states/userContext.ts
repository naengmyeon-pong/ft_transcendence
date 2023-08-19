import {DmListData, UserType} from '@/types/UserContext';
import {atom} from 'recoil';
import {Socket} from 'socket.io-client';

export const userIdState = atom<string | null>({
  key: 'userIdState',
  default: null,
});

export const userImageState = atom<string | null>({
  key: 'userImageState',
  default: null,
});
export const userNicknameState = atom<string | null>({
  key: 'userNicknameState',
  default: null,
});

export const blockUsersState = atom<Map<string, UserType>>({
  key: 'blockUsersState',
  default: new Map(),
});

export const convertPageState = atom<number>({
  key: 'convertPageState',
  default: 0,
});

export const dmListState = atom<DmListData[]>({
  key: 'dmListState',
  default: [],
});

export const profileDMChoise = atom<boolean>({
  key: 'profileDMChoise',
  default: false,
});

export const dmBadgeCnt = atom<number>({
  key: 'dmBadgeCnt',
  default: 0,
});
