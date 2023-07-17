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
        <Box>
          <Outlet />
        </Box>
      </Box>
    </>
  );
}

export default MainLayout;
