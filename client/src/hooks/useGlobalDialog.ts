import {useRecoilState} from 'recoil';

import {globalDialogState} from '@/states/globalDialog';
import {GlobalDialogType} from '@/types/GlobalDialog';

export const useGlobalDialog = () => {
  const [globalDialogDataState, setGlobalDialogDataState] =
    useRecoilState(globalDialogState);

  const closeGlobalDialog = () => {
    setGlobalDialogDataState(prev => {
      return {...prev, isOpen: false};
    });
  };

  const openGlobalDialog = (globalDialogContent: Partial<GlobalDialogType>) => {
    setGlobalDialogDataState(prev => {
      return {...prev, ...globalDialogContent, isOpen: true};
    });
  };

  return {
    globalDialogDataState,
    closeGlobalDialog,
    openGlobalDialog,
  };
};
