import {atom} from 'recoil';
import {AlertSnackbarType} from '@/types/alertSnackbar';

export const alertSnackbarState = atom<AlertSnackbarType>({
  key: 'alertSnackbarState',
  default: {
    isOpen: false,
    message: '오류가 발생했습니다. 다시 시도해주세요',
    severity: 'error',
  },
});
