import {Box} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import ChatList from './ListPage';
import ChatRoom from './RoomPage';
import {UserContext} from 'Context';

export default function ChatPage() {
  const {convert_page, setConvertPage} = useContext(UserContext);

  useEffect(() => {
    // 채팅방안에 접근해서 새로고침 할 경우 유지할때 사용함
    const room_id = sessionStorage.getItem('room_id');
    if (room_id !== null) {
      setConvertPage(Number(room_id));
    }
    return () => {};
  }, []);
  return (
    <>
      {convert_page === 0 ? <ChatList /> : <ChatRoom />}
      <Box></Box>
    </>
  );
}
