'use client';

import {useGlobalModal} from '@/hooks/useGlobalModal';
import {UserType} from '@/types/UserContext';
import {
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import React, {useCallback} from 'react';
import Block from '@/components/Block';
import SimpleRecord from '@/components/Record/SimpleRecord';
import {HandleAddDmList} from '@/components/UserProfileModal/DMButton';
import {Test} from '@/components/UserProfileModal/Test';
import ProfileGame from './Game';

export default function UserInfoPage({user_info}: {user_info: UserType}) {
  const {openGlobalModal} = useGlobalModal();

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

  const action = useCallback(() => {
    return (
      <>
        <Box display="flex" justifyContent="space-between">
          <Test user_info={user_info} />
          <ProfileGame user_info={user_info} />
          <HandleAddDmList user_info={user_info} />
          <Block block_user={user_info} component={Button} />
        </Box>
        <Divider sx={{mt: 2, mb: 2}} />
        <Box display="flex" flexDirection="column">
          <SimpleRecord />
        </Box>
      </>
    );
  }, [user_info]);

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
