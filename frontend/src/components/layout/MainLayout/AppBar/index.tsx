'use client';
import React from 'react';
import Link from 'next/link';
import logo from '@/public/logo.jpeg';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';

import AlarmEvent from './Alarm';
import LogOut from './LogOut';

const customTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'black',
          marginLeft: '1em',
        },
      },
    },
  },
});

function CustomAppBar() {
  return (
    <ThemeProvider theme={customTheme}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{display: 'flex'}}
          >
            <Avatar alt="로고" src={logo.src} />
          </Typography>
          <Box sx={{flexGrow: 1}}>
            <Link href="/main/game">
              <Button>게임하기</Button>
            </Link>
            <Link href="/main/chat">
              <Button>채팅목록</Button>
            </Link>
          </Box>
          <Box sx={{flexGrow: 0}}>
            <AlarmEvent />
            <Link href="/user/setting">
              <Button>마이페이지</Button>
            </Link>
            <LogOut />
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default CustomAppBar;
