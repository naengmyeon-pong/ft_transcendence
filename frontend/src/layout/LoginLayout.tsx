import React from 'react';
import {Outlet} from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

function LoginLayout() {
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Child components */}
        <Outlet />
        {/* Child components */}
      </Box>
    </Container>
  );
}

export default LoginLayout;
