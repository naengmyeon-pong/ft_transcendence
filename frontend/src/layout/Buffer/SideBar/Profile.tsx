import React from 'react';
import {useState, useEffect} from 'react';
import {Avatar, Box, Typography} from '@mui/material';
import apiManager from '@apiManager/apiManager';

// TODO: 닉네임, 랭크, 사진 변경필요합니다
export default function Profile() {
  const rankNum = '랭크점수: 1000';

  const [nickname, setNickname] = useState('');
  const [userImage, setUserImage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        console.log('hello');
        const response = await apiManager.get('/user/user-info');
        console.log(response);
        const {user_nickname, user_image} = response.data;
        setNickname(user_nickname);
        setUserImage(`http://localhost:3001/${user_image}`);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

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
        <Avatar src={userImage} alt="프로필사진" />
        {/* </Typography> */}
        <Box sx={{px: '10px'}}>
          <Typography variant="h6">{nickname}</Typography>
          <Typography variant="h6" sx={{fontSize: '1em'}}>
            {rankNum}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
