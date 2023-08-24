'use client';
import {Grid, Typography, styled} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';

import ChatBox from './ChatBox';
import UserList from './UserList';
import {useRouter} from 'next/router';
import {UserContext} from '@/components/layout/MainLayout/Context';
import apiManager from '@/api/apiManager';
import axios from 'axios';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import * as HTTP_STATUS from 'http-status';
import {useSetRecoilState} from 'recoil';
import {tokenExpiredExit} from '@/states/tokenExpired';

const BoxBorder = styled('div')({
  border: '1px solid black',
  borderRadius: '5px',
});

// 채팅방에 입장해서 실행하는 컴포넌트
function ChatRoom() {
  const [roomName, setRoomName] = useState();
  const roomId = useContext(UserContext).convert_page;
  const {setConvertPage} = useContext(UserContext);
  const router = useRouter();
  const [init_chat_room, setInitChatRoom] = useState(false);
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);

  console.log('ChatRoom');
  async function SearchRoom() {
    try {
      const rep = await apiManager.get(`/chatroom/join_room?room_id=${roomId}`);
      console.log('ChatRoom.tsx: ', rep.data);
      setRoomName(rep.data?.name);
      setInitChatRoom(true);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
      setConvertPage(0);
      router.back();
    }
  }

  useEffect(() => {
    SearchRoom();
  }, []);

  return (
    <>
      {init_chat_room && (
        <Grid container spacing={2}>
          <Grid item xs={7}>
            <BoxBorder style={{backgroundColor: '#e0e0e0'}}>
              <Typography variant="body1" ml={'10px'}>
                {roomName}
              </Typography>
            </BoxBorder>
            <BoxBorder style={{height: '400px'}}>
              {/* 채팅창영역 */}
              <ChatBox />
            </BoxBorder>
          </Grid>
          <Grid item xs={3}>
            <UserList />
          </Grid>
        </Grid>
      )}
    </>
  );
}
export default ChatRoom;
