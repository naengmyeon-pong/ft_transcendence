import {Box, Button, Modal} from '@mui/material';
import React from 'react';
import ModalPrint from './ModalPrint';
import {UserType} from '@/types/UserContext';
import {modalStyle} from '@/components/styled/modalStyle';

interface ServiceModalProps {
  modalState: boolean;
  onRequestClose: (confirmed: boolean) => void;
  menuItem: string | null;
  user: UserType;
}

// 닉네임과 수행할 기능을 받고 yes, or를 리턴하는 함수
function ServiceModal({
  modalState,
  onRequestClose,
  menuItem,
  user,
}: ServiceModalProps) {
  const handleYesClick = () => {
    // 모달을 닫고, 기능을 수행했음을 부모 컴포넌트에 알립니다.
    onRequestClose(true);
  };

  const handleNoClick = () => {
    // 모달을 닫고, 기능을 수행하지 않았음을 부모 컴포넌트에 알립니다.
    onRequestClose(false);
  };

  return (
    <>
      <Modal open={modalState} onClose={() => onRequestClose(false)}>
        <Box sx={modalStyle}>
          <ModalPrint user={user} menuItem={menuItem} />
          <Box mt={'5px'} display="flex" justifyContent="flex-end">
            <Button onClick={handleYesClick}>예</Button>
            <Button onClick={handleNoClick}>아니오</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default ServiceModal;
