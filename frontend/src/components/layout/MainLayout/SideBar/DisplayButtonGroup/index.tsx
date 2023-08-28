import {Box, Button, ButtonGroup, Typography} from '@mui/material';
import React from 'react';

interface DisplayButtonGroupProps {
  lstState: number;
  setLstState: React.Dispatch<React.SetStateAction<number>>;
  block_user_cnt: number;
  friend_cnt: number;
}

export default function DisplayButtonGroup({
  lstState,
  setLstState,
  block_user_cnt,
  friend_cnt,
}: DisplayButtonGroupProps) {
  function friendListTap() {
    if (lstState === 1) {
      return;
    }
    setLstState(1);
  }

  function blockUserListTap() {
    if (lstState === 0) {
      return;
    }
    setLstState(0);
  }

  function directMessageUserListTap() {
    if (lstState === 2) {
      return;
    }
    setLstState(2);
  }
  return (
    <>
      <ButtonGroup>
        <Button
          variant={lstState === 0 ? 'contained' : 'outlined'}
          onClick={blockUserListTap}
          sx={{
            borderRadius: '13px',
            borderColor: 'black',
            color: lstState === 0 ? 'white' : 'black',
          }}
        >
          <Box display="flex" sx={{flexDirection: 'column'}}>
            <Typography>차단 목록</Typography>
            <Typography>{`${block_user_cnt}`}</Typography>
          </Box>
        </Button>
        <Button
          variant={lstState === 1 ? 'contained' : 'outlined'}
          onClick={friendListTap}
          sx={{
            borderRadius: '13px',
            borderColor: 'black',
            color: lstState === 1 ? 'white' : 'black',
          }}
        >
          <Box display="flex" sx={{flexDirection: 'column'}}>
            <Typography>친구 목록</Typography>
            <Typography>{`${friend_cnt}`}</Typography>
          </Box>
        </Button>
        <Button
          variant={lstState === 2 ? 'contained' : 'outlined'}
          onClick={directMessageUserListTap}
          sx={{
            borderRadius: '13px',
            borderColor: 'black',
            color: lstState === 2 ? 'white' : 'black',
          }}
        >
          <Box display="flex" sx={{flexDirection: 'column'}}>
            <Typography width={'60px'}>DM</Typography>
          </Box>
        </Button>
      </ButtonGroup>
    </>
  );
}
