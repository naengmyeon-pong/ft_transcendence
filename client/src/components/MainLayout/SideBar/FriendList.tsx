'use client';
import React, {useContext, useState} from 'react';

import {
  Avatar,
  Badge,
  List,
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
import UserInfoPage from './UserPrintPage';
// import {UserContext} from 'Context';
// import UserInfoPage from 'pages/UserInfoPage/UserPrintPage';

const StyledBadge = styled(Badge)(({theme}) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'grey',
    color: 'grey',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

// TODO: 유저명, 이미지, 유저상태 변경 필요합니다
function FriendList({friend}: {friend: UserType}) {
  const [anchorEl, setAnchorEl] = useState<HTMLLIElement | null>(null);
  const {socket, dm_list, setDmList, user_id} = useContext(UserContext);
  const open = Boolean(anchorEl);
  const [userInfoPage, setUserInfoPage] = useState(false);

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
    setUserInfoPage(true);
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
          <Typography>프로필 보기</Typography>
        </MenuItem>
      </Menu>
      {userInfoPage && <UserInfoPage user_info={friend} />}
    </>
  );
}
export default FriendList;
