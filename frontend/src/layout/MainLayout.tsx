import React from 'react';
import {Box, CssBaseline, Toolbar} from '@mui/material';
import FtAppBar from './Buffer/FtAppBar';
import FtSideBar from './Buffer/SideBar/FtSideBar';
import {Outlet} from 'react-router-dom';

function MainLayout() {
  return (
    <>
      <CssBaseline />
      <FtAppBar />
      <Toolbar />
      <Box display="flex">
        <Box>
          <FtSideBar />
        </Box>
        <Box width="80vw" paddingLeft="150px">
          {/* 게임하기, 전체랭킹, 채팅목록 */}
          <Outlet />
          {/* 개인 채팅창 위치 */}
        </Box>
      </Box>
    </>
  );
}

export default MainLayout;
