import ChatList from '@/components/Chat/ListPage';
import ChatRoom from '@/components/Chat/RoomPage';
import {UserContext} from '@/components/MainLayout/Context';
import {Box} from '@mui/material';
import React, {useContext, useEffect} from 'react';

export default function ChatPage() {
  const {convert_page} = useContext(UserContext);

  console.log('ChatPage');

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
