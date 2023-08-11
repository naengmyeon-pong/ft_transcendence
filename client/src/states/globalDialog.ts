import {atom} from 'recoil';
import {GlobalDialogType} from '@/types/GlobalDialog';

export const globalDialogState = atom<GlobalDialogType>({
  key: 'globalDialogState',
  default: {
    isOpen: false,
    title: '',
    content: null,
    contentText: null,
    actions: null,
  },
});
