'use client';

import {useState} from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Drawer,
  Toolbar,
  Typography,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Profile from './Profile';
import FriendList from './FriendList';
import ConnectUserList from './ConnectUserList';

function SideBar() {
  console.log('SideBar');
  // lstState: true = 친구목록, flase = 접속 유저
  const [lstState, setLstState] = useState(true);
  const drawerWidth = 240;

  function friendList() {
    if (lstState === true) {
      return;
    }
    setLstState(!lstState);
  }

  function connectUserList() {
    if (lstState === false) {
      return;
    }
    setLstState(!lstState);
  }

  function connectUserCount() {
    return '(1)';
  }

  function friendListCount() {
    return '(0/1)';
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          ['& .MuiDrawer-paper']: {
            width: drawerWidth,
            // boxSizing: 'border-box',
          },
          display: {sm: 'block', xs: 'none'},
        }}
      >
        <Toolbar />
        <Box sx={{overflow: 'auto'}}>
          <Box
            sx={{
              p: '5px',
            }}
          >
            <Profile />
          </Box>
          <Divider />
          <Box
            display="flex"
            sx={{
              justifyContent: 'center',
              py: '1em',
            }}
          >
            <ButtonGroup>
              <Button
                variant={lstState ? 'contained' : 'outlined'}
                onClick={friendList}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState ? 'white' : 'black',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  <Typography>친구 목록</Typography>
                  <Typography>{friendListCount()}</Typography>
                </Box>
              </Button>
              <Button
                variant={lstState ? 'outlined' : 'contained'}
                onClick={connectUserList}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState ? 'black' : 'white',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  <Typography>접속 유저</Typography>
                  <Typography>{connectUserCount()}</Typography>
                </Box>
              </Button>
            </ButtonGroup>
          </Box>

          <Box display="flex" sx={{justifyContent: 'center', p: '0.5em'}}>
            <PersonAddAlt1Icon />
          </Box>
          {/* true: 친구목록, flase: 접속 유저 */}
          {lstState ? <FriendList /> : <ConnectUserList />}
          {/* 밑줄 */}
          <Divider />
        </Box>
      </Drawer>
    </>
  );
}

export default SideBar;
