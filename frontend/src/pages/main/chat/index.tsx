'use client';
import ChatList from '@/components/Chat/ListPage';
import ChatRoom from '@/components/Chat/RoomPage';
import {UserContext} from '@/components/layout/MainLayout/Context';
import React, {useContext} from 'react';

export default function ChatPage() {
  const {convert_page} = useContext(UserContext);
  console.log('ChatPage');

  return <>{convert_page === 0 ? <ChatList /> : <ChatRoom />}</>;
}
