import apiManager from '@apiManager/apiManager';
import {Box, Button, Grid, Typography, styled} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import ChatInvite from '../modal/ChatInvite';
import ChatBox from './ChatBox';
import UserNode from './menu/UserNode';
import {UserContext} from 'Context';
import UserList from './UserList';

const BoxBorder = styled('div')({
  border: '1px solid black',
  borderRadius: '5px',
});

// 채팅방에 입장해서 실행하는 컴포넌트
function ChatRoom() {
  const {roomName} = useParams();
  const {roomId} = useParams();
  const navigate = useNavigate();

  async function SearchRoom() {
    try {
      // url로 직접 접근하는 경우
      const rep = await apiManager.get(`/chatroom/join_room?room_id=${roomId}`);
      console.log(rep);
    } catch (error) {
      console.log(error);
      alert('비정상 접근입니다');
      navigate(-1);
    }
  }

  useEffect(() => {
    SearchRoom();
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   event.preventDefault();
    //   event.returnValue = 'test';
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);
    // // window.addEventListener('unload', handleUnloadCancel);
    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    //   // window.addEventListener('unload', handleUnloadCancel);
    // };
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <BoxBorder>
            <Typography variant="body1">{roomName}</Typography>
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
    </>
  );
}
export default ChatRoom;
