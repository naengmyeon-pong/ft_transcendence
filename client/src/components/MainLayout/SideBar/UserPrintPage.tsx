'use client';
import {UserType} from '@/types/UserContext';
import {
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

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

export default function UserInfoPage({user_info}: {user_info: UserType}) {
  const [openModal, setOpenModal] = useState<boolean>(true);

  const modalClose = () => setOpenModal(false);

  return (
    <>
      <Modal open={openModal} onClose={modalClose}>
        <Box sx={style}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar alt="friend profile memo" src={`${user_info.image}`} />
            </ListItemAvatar>

            <ListItemText
              primary={user_info.nickName}
              secondary={
                <Typography
                  sx={{display: 'inline'}}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {'오프라인'}
                </Typography>
              }
            />
          </ListItem>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Button>전적보기</Button>
            <Button>1:1 게임하기</Button>
            <Button>1:1 대화하기</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
