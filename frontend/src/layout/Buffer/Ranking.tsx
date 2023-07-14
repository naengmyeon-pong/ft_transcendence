import React from 'react';
import {Typography} from '@mui/material';
import {Box} from '@mui/material';

export default function Ranking() {
  return (
    <Box component="main" sx={{flexGrow: 1, p: 3}}>
      <Typography variant="h3" align="center">
        전체랭킹
      </Typography>
      <Box flexDirection="column">
        <Box display="flex" justifyContent="center">
          <img
            src="/rankImg.png"
            style={{
              objectFit: 'cover',
              width: '70%',
              height: '100%',
              justifyContent: 'center',
            }}
            alt="게임사진"
          />
        </Box>
      </Box>
    </Box>
  );
}
