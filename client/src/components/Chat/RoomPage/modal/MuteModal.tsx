'use client';
import React from 'react';
import {Box, Button, Modal, Typography} from '@mui/material';
import {modalStyle} from '@/components/styled/modalStyle';

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
    const timer = 300 - Math.floor((new Date().getTime() - muteTimer) / 1000);
    const minute = Math.floor(timer / 60);
    const second = timer % 60;
    return minute + '분' + (second + '초');
  }

  return (
    <>
      <Modal open={muteModal} onClose={handleMuteClose}>
        <Box sx={modalStyle}>
          <Typography variant="h4">음소거</Typography>
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
