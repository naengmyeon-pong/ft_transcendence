'use client';

import {useGlobalModal} from '@/hooks/useGlobalModal';
import {UserType} from '@/types/UserContext';
import {
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import React, {useCallback, useContext} from 'react';
import {UserContext} from '../MainLayout/Context';
import Block from '@/components/Block';
import {useRecoilState} from 'recoil';
import {dmList, dmUserInfo} from '@/states/dmUser';
import {profileDMChoise} from '@/states/userContext';

interface UserInfoPageProps<T> {
  user_info: UserType;
  // dm 실행결과를 리턴
  // dmCallback?: T;
}

export default function UserInfoPage<T>({
  user_info, // dmCallback,
}: UserInfoPageProps<T>) {
  const {openGlobalModal, closeGlobalModal} = useGlobalModal();
  const {user_id} = useContext(UserContext);
  const [dm_list, setDmList] = useRecoilState(dmList);
  const [, setDmUser] = useRecoilState(dmUserInfo);
  const [, setDmChoise] = useRecoilState(profileDMChoise);

  const content = useCallback(() => {
    return (
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt="friend profile memo" src={`${user_info.image}`} />
        </ListItemAvatar>

        <ListItemText
          primary={user_info.nickName}
          secondary={
            <Typography
              sx={{display: 'inline'}}
              component="span"
              variant="body2"
              color="text.primary"
            >
              {'오프라인'}
            </Typography>
          }
        />
      </ListItem>
    );
  }, [user_info.image, user_info.nickName]);

  const handleAddDmList = useCallback(() => {
    // dm 리스트에서 확인하는것이 아닌 dmuser를 찾아서 확인하는것으로 변경하여야 함
    // if (dm_list.some(node => node.user2 === user_info.id) || user_id === null) {
    //   closeGlobalModal();
    //   return;
    // }
    console.log('클릭');
    setDmChoise(true);
    setDmUser(prev => {
      if (prev?.id === user_info.id) {
        return prev;
      }
      return {
        nickName: user_info.nickName,
        id: user_info.id,
        image: user_info.nickName,
      };
    });
    if (user_id === null) {
      return;
    }
    setDmList(prev => {
      if (prev.some(item => item.user2 === user_info.id)) {
        console.log('추가안됨');
        return prev;
      }
      console.log('추가됨');
      return [
        ...prev,
        {
          user1: user_id,
          user2: user_info.id,
          nickname: user_info.nickName,
        },
      ];
    });

    closeGlobalModal();
  }, [
    user_info.id,
    user_info.nickName,
    setDmUser,
    closeGlobalModal,
    setDmList,
    user_id,
    setDmChoise,
  ]);

  const action = useCallback(() => {
    return (
      <Box display={'flex'} justifyContent={'space-between'}>
        <Button>전적보기</Button>
        <Button>1:1 게임하기</Button>
        <Button onClick={handleAddDmList}>1:1 대화하기</Button>
        <Block block_user={user_info} component={Button} />
      </Box>
    );
  }, [handleAddDmList, user_info]);

  function handleClick() {
    openGlobalModal({
      title: '프로필 보기',
      content: content(),
      action: action(),
    });
  }

  return (
    <>
      <Typography onClick={handleClick}>프로필 보기</Typography>
    </>
  );
}
