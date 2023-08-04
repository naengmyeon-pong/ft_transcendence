import {Box} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import ChatList from '.';
import ChatRoom from './room';
import {UserContext} from 'Context';

export default function ChatPage() {
  const {convert_page} = useContext(UserContext);

  useEffect(() => {
    // const room_id = sessionStorage.getItem('room_id');
    // if (room_id !== null) {
    //   setConvertPage(Number(room_id));
    // }
    return () => {};
  }, []);
  return (
    <>
      {convert_page === 0 ? <ChatList /> : <ChatRoom />}
      <Box></Box>
    </>
  );
}
