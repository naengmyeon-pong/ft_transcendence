import React from 'react';
import {Avatar, Box, Typography} from '@mui/material';

// TODO: 닉네임, 랭크, 사진 변경필요합니다
export default function Profile() {
  const userName = '방글맨방글방글맨';
  const rankNum = '랭크점수: 1000';
  return (
    <Box
      sx={{
        px: '10px',
        py: '10px',
        border: '1px solid #bdbdbd',
        borderRadius: '16px',
        // borderInlineColor: "#bdbdbd",
        // borderInlineEndColor: "#bdbdbd",
      }}
    >
      <Box display="flex">
        {/* <Typography variant="h6" noWrap component="p"> */}
        <Avatar src="/logo.jpeg" />
        {/* </Typography> */}
        <Box sx={{px: '10px'}}>
          <Typography variant="h6">{userName}</Typography>
          <Typography variant="h6" sx={{fontSize: '1em'}}>
            {rankNum}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
