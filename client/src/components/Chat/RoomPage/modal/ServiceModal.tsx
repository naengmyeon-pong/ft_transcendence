import {Box, Button, Modal} from '@mui/material';
import React from 'react';
import ModalPrint from './ModalPrint';
const style = {
  position: 'absolute',
  top: '40%',
  left: '48%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #FFF',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

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
        <Box sx={style}>
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
