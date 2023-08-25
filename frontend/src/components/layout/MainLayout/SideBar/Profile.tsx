'use client';

import {useRecoilValue} from 'recoil';

import {Avatar, Box, Typography} from '@mui/material';

import {profileState} from '@/states/profile';

// TODO: 닉네임, 랭크, 사진 변경필요합니다
export default function Profile() {
  const {image, nickname, rank_score} = useRecoilValue(profileState);

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
        <Avatar src={image} alt="프로필사진" />
        {/* </Typography> */}
        <Box sx={{px: '10px'}}>
          <Typography variant="h6">{nickname}</Typography>
          <Typography variant="h6" sx={{fontSize: '1em'}}>
            랭크 점수 : {rank_score}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
