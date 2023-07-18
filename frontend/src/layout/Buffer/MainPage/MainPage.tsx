import React from 'react';
import {Box, Toolbar, Typography} from '@mui/material';

function MainPage() {
  console.log('MainPage');
  return (
    <>
      {/* <Toolbar /> */}
      <Box component="main" sx={{flexGrow: 1, p: 3}}>
        <Typography variant="h3" align="center">
          게임하기
        </Typography>
        <Box flexDirection="column">
          <Box display="flex" justifyContent="center">
            <img
              src="/gameImg.png"
              style={{
                objectFit: 'cover',
                width: '70%',
                height: '100%',
                justifyContent: 'center',
              }}
              alt="게임사진"
            />
          </Box>
          {/* <WaitingChannelRoom /> */}
        </Box>
      </Box>
    </>
  );
}

export default MainPage;
