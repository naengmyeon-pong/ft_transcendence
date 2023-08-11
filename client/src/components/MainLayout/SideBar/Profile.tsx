'use client';
import React, {useContext} from 'react';
import {Avatar, Box, Typography} from '@mui/material';
import {UserContext} from '../Context';

// TODO: 닉네임, 랭크, 사진 변경필요합니다
export default function Profile() {
  const rankNum = '랭크점수: 1000';

  const {user_nickname} = useContext(UserContext);
  const {user_image} = useContext(UserContext);

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
        <Avatar
          src={`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/${user_image}`}
          alt="프로필사진"
        />
        {/* </Typography> */}
        <Box sx={{px: '10px'}}>
          <Typography variant="h6">{user_nickname}</Typography>
          <Typography variant="h6" sx={{fontSize: '1em'}}>
            {rankNum}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
