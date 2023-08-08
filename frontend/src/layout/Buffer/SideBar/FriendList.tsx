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
import {UserContext} from 'Context';

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

  function handleMenu(event: React.MouseEvent<HTMLLIElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleDeleteFriend() {
    console.log('친구 삭제이벤트 전송');
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

  return (
    <>
      <ListItem
        alignItems="flex-start"
        onClick={handleMenu}
        sx={{border: '1px solid gray', borderRadius: '13px'}}
      >
        <ListItemAvatar>
          <Avatar alt="friend profile memo" src="/logo.jpeg" />
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
        // sx={{
        //   marginLeft: '10px',
        // }}
      >
        <MenuItem onClick={handleDeleteFriend}>
          <Typography>친구 삭제</Typography>
        </MenuItem>
        <MenuItem onClick={handleAddDmList}>
          <Typography>1:1 대화하기</Typography>
        </MenuItem>
      </Menu>
    </>

    /* <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            variant="dot"
          >
            <Avatar alt="friend profile memo" src="/logo.jpeg" />
          </StyledBadge>
        </ListItemAvatar>
        <ListItemText
          primary={'username'}
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
      </ListItem> */
  );
}
export default FriendList;
