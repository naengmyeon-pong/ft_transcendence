import {useCallback} from 'react';

import {useRecoilState} from 'recoil';

import {alertSnackbarState} from '@/states/alertSnackbar';
import {OpenSnackbarType} from '@/types/AlertSnackbar';

export const useAlertSnackbar = () => {
  const [alertSnackbarDataState, setAlertSnackbarDataState] =
    useRecoilState(alertSnackbarState);

  const closeAlertSnackbar = useCallback(
    (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }

      setAlertSnackbarDataState(prev => {
        return {...prev, isOpen: false};
      });
    },
    [setAlertSnackbarDataState]
  );

  const openAlertSnackbar = useCallback(
    ({message, severity, callback}: OpenSnackbarType) => {
      setAlertSnackbarDataState({
        isOpen: true,
        message: message || '오류가 발생했습니다. 다시 시도해주세요.',
        severity: severity || 'error',
        callBack: callback,
      });
    },
    [setAlertSnackbarDataState]
  );

  return {
    alertSnackbarDataState,
    closeAlertSnackbar,
    openAlertSnackbar,
  };
};
