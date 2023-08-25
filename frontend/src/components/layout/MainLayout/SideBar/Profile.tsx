'use client';

import {useRecoilValue} from 'recoil';

import {Avatar, Box, Typography, Button} from '@mui/material';

import RecordSummary from '@/components/Record/RecordSummary';
import DetailRecord from '@/components/Record/DetailRecord';
import {profileState} from '@/states/profile';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';
import {UserType} from '@/types/UserContext';

function ProfileDialog() {
  const {nickname, image, user_id} = useRecoilValue(profileState);
  const user_info: UserType = {
    nickName: nickname,
    id: user_id,
    image,
  };
  return (
    <>
      <Box display="flex" flexDirection="column">
        <RecordSummary user_info={user_info} />
      </Box>
      <Box display="flex" flexDirection="column">
        <DetailRecord user_info={user_info} />
      </Box>
    </>
  );
}

export default function Profile() {
  const {image, nickname, rank_score} = useRecoilValue(profileState);
  const {openGlobalDialog, closeGlobalDialog} = useGlobalDialog();

  const handleOpenProfile = () => {
    openGlobalDialog({
      content: <ProfileDialog />,
      actions: (
        <Button onClick={closeGlobalDialog} autoFocus>
          닫기
        </Button>
      ),
    });
  };

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
          <Button onClick={handleOpenProfile}>전적 보기</Button>
        </Box>
      </Box>
    </Box>
  );
}
