'use client';
import {useRecoilState} from 'recoil';
import {globalModalState} from '@/states/globalModal';
import {GlobalModalType} from '@/types/GlobalModal';

export const useGlobalModal = () => {
  const [global_modal_data, setGlobalModalData] =
    useRecoilState(globalModalState);

  const closeGlobalModal = () => {
    setGlobalModalData({isOpen: false});
  };

  const openGlobalModal = (globalModalContent: Partial<GlobalModalType>) => {
    setGlobalModalData({...globalModalContent, isOpen: true});
  };

  return {
    global_modal_data,
    closeGlobalModal,
    openGlobalModal,
  };
};
