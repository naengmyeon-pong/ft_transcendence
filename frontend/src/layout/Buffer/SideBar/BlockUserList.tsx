import React, {useContext, useState} from 'react';
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {DelBlock} from 'pages/ChatPage/RoomPage/service/Block';
import {UserContext} from 'Context';

export default function BlockUserList({block_user}: {block_user: UserType}) {
  const [anchorEl, setAnchorEl] = useState<HTMLLIElement | null>(null);
  const {socket, block_users} = useContext(UserContext);
  const open = Boolean(anchorEl);

  function handleMenuClose() {
    setAnchorEl(null);
  }

  function handleMenu(event: React.MouseEvent<HTMLLIElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleDeleteBlock() {
    DelBlock(block_user, socket, block_users);
    handleMenuClose();
  }

  return (
    <>
      <ListItem alignItems="flex-start" onClick={handleMenu}>
        <ListItemAvatar>
          <Avatar
            alt="friend profile memo"
            src={`${process.env.REACT_APP_BACKEND_SERVER}/${block_user.image}`}
          />
        </ListItemAvatar>
        <ListItemText primary={`${block_user.nickName}`} />
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
        <MenuItem onClick={handleDeleteBlock}>
          <Typography>차단 해제</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
