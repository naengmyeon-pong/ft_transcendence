'use client';
import React, {useCallback, useContext, useEffect, useState} from 'react';

import {
  Avatar,
  Badge,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  styled,
} from '@mui/material';
import {UserType} from '@/types/UserContext';
import {UserContext} from '../Context';
import {useGlobalModal} from '@/hooks/useGlobalModal';
import UserInfoPage from './UserPrintPage';

const StyledBadge = styled(Badge)(({theme}) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'grey',
    color: 'grey',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

function FriendList({friend}: {friend: UserType}) {
  const [anchorEl, setAnchorEl] = useState<HTMLLIElement | null>(null);
  const {socket, dm_list, setDmList, user_id} = useContext(UserContext);
  const open = Boolean(anchorEl);

  function handleMenu(event: React.MouseEvent<HTMLLIElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleDeleteFriend() {
    socket?.emit('del-friend', friend.id);
    setAnchorEl(null);
  }
  function handleAddDmList() {
    if (dm_list.some(node => node.user2 === friend.id) || user_id === null) {
      return;
    }
    setDmList([
      ...dm_list,
      {
        user1: user_id,
        user2: friend.id,
        nickname: friend.nickName,
      },
    ]);
  }

  const OpenUserInfoPage = () => {
    console.log('클릭: OpenUserInfoPage');
    setAnchorEl(null);
  };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        onClick={handleMenu}
        sx={{border: '1px solid gray', borderRadius: '13px'}}
      >
        <ListItemAvatar>
          <Avatar alt="friend profile memo" src={`${friend.image}`} />
        </ListItemAvatar>

        <ListItemText
          primary={friend.nickName}
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
      <Menu
        open={open}
        onClose={handleMenuClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleDeleteFriend}>
          <Typography>친구 삭제</Typography>
        </MenuItem>
        <MenuItem onClick={handleAddDmList}>
          <Typography>1:1 대화하기</Typography>
        </MenuItem>
        <MenuItem onClick={OpenUserInfoPage}>
          <UserInfoPage user_info={friend} />
        </MenuItem>
      </Menu>
    </>
  );
}
export default FriendList;
