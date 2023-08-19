'use client';

import {useState, useCallback} from 'react';

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

import {useGlobalModal} from '@/hooks/useGlobalModal';
import {UserType} from '@/types/UserContext';
import Block from '@/components/Block';
import RecordSummary from '@/components/Record/RecordSummary';
import {HandleAddDmList} from '@/components/UserProfileModal/DMButton';
import {Test} from '@/components/UserProfileModal/Test';
import ProfileGame from '@/components/UserProfileModal/Game';
import DetailRecord from '../Record/DetailRecord';

function UserProfileModalAction({user_info}: {user_info: UserType}) {
  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <ProfileGame user_info={user_info} />
        <HandleAddDmList user_info={user_info} />
        <Block block_user={user_info} component={Button} />
      </Box>
      <Divider sx={{mt: 2, mb: 2}} />
      <Box display="flex" flexDirection="column">
        <RecordSummary />
      </Box>
      <Box display="flex" flexDirection="column">
        <DetailRecord user_info={user_info} />
      </Box>
    </>
  );
}

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

  function handleClick() {
    openGlobalModal({
      title: '프로필 보기',
      content: content(),
      action: <UserProfileModalAction user_info={user_info} />,
    });
  }

  return (
    <>
      <Typography onClick={handleClick}>프로필 보기</Typography>
    </>
  );
}
