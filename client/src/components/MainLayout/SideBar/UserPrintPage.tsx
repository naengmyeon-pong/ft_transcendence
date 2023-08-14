'use client';
import CustomModal from '@/components/GlobalModal';
import {useGlobalModal} from '@/hooks/useGlobalModal';
import {UserType} from '@/types/UserContext';
import {
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  // Modal,
  Typography,
} from '@mui/material';
import React, {useCallback, useContext} from 'react';
import {UserContext} from '../Context';

export default function UserInfoPage({user_info}: {user_info: UserType}) {
  const {openGlobalModal, closeGlobalModal} = useGlobalModal();
  const {dm_list, setDmList, user_id} = useContext(UserContext);

  const content = useCallback(() => {
    return (
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
    );
  }, [user_info.image, user_info.nickName]);

  function handleAddDmList() {
    if (dm_list.some(node => node.user2 === user_info.id) || user_id === null) {
      return;
    }
    setDmList([
      ...dm_list,
      {
        user1: user_id,
        user2: user_info.id,
        nickname: user_info.nickName,
      },
    ]);
    closeGlobalModal();
  }

  const action = useCallback(() => {
    return (
      <Box display={'flex'} justifyContent={'space-between'}>
        <Button>전적보기</Button>
        <Button>1:1 게임하기</Button>
        <Button onClick={handleAddDmList}>1:1 대화하기</Button>
      </Box>
    );
  }, []);

  function handleClick() {
    openGlobalModal({
      title: '프로필 보기',
      content: content(),
      action: action(),
    });
  }

  return (
    <>
      <Typography onClick={handleClick}>프로필 보기</Typography>
    </>
  );
}
