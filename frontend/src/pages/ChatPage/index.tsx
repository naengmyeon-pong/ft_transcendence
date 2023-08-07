import {Box} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import ChatList from './ListPage';
import ChatRoom from './RoomPage';
import {UserContext} from 'Context';

export default function ChatPage() {
  const {convert_page, setConvertPage} = useContext(UserContext);

  useEffect(() => {
    return () => {};
  }, []);
  return (
    <>
      {convert_page === 0 ? <ChatList /> : <ChatRoom />}
      <Box></Box>
    </>
  );
}
