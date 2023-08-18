import {GlobalModalType} from '@/types/GlobalModal';
import {atom} from 'recoil';

export const globalModalState = atom<GlobalModalType>({
  key: 'globalModalState',
  default: {
    isOpen: false,
    title: '',
    content: undefined,
    action: undefined,
  },
});

export const testInputState = atom({
  key: 'testInputState',
  default: '',
});
