import React from 'react';
import {Box, CssBaseline, Grid, Toolbar} from '@mui/material';
import FtAppBar from './Buffer/FtAppBar';
import FtSideBar from './Buffer/SideBar/FtSideBar';
import {Outlet} from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

function MainLayout() {
  return (
    <>
      <Box height={'100vh'}>
        <CssBaseline />
        <FtAppBar />
        <Toolbar />
        <Box display="flex">
          <Box>
            <FtSideBar />
          </Box>
          {/* <Box width="80vw" paddingLeft="150px"> */}
          {/* <Box flexGrow="1"> */}
          <Grid container justifyContent="center">
            <Grid item xs={8}>
              {/* <Box> */}
              {/* 게임하기, 전체랭킹, 채팅목록 */}
              <Outlet />
              {/* 개인 채팅창 위치 */}
            </Grid>
          </Grid>
          {/* </Box> */}
        </Box>
      </Box>
    </>
  );
}

export default MainLayout;
