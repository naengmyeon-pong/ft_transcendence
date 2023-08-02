import React from 'react';
import {Box, Button, Modal, Typography} from '@mui/material';

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

type MuteModalProps = {
  muteModal: boolean;
  handleMuteClose: React.Dispatch<React.SetStateAction<boolean>>;
  muteTimer: number;
};

export default function MuteModal({
  muteModal,
  handleMuteClose,
  muteTimer,
}: MuteModalProps) {
  function getTimer() {
    // const five_minute = 5 * 60 * 1000;
    const timer = Math.abs(new Date().getTime() - muteTimer) / 1000;
    return timer;
  }

  return (
    <>
      <Modal open={muteModal} onClose={handleMuteClose}>
        <Box sx={style}>
          <Typography variant="h4">음소거(5분)</Typography>
          <Typography variant="body1">
            5분 동안 채팅을 하실 수 없습니다.
          </Typography>
          <Typography variant="body1">{getTimer()} 남았습니다</Typography>
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={() => handleMuteClose(false)}>닫기</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
