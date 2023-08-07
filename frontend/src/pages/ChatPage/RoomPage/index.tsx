import apiManager from '@apiManager/apiManager';
import {Grid, Typography, styled} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import ChatBox from './ChatBox';
import UserList from './UserList';
import {UserContext} from 'Context';

const BoxBorder = styled('div')({
  border: '1px solid black',
  borderRadius: '5px',
});

// 채팅방에 입장해서 실행하는 컴포넌트
function ChatRoom() {
  const [roomName, setRoomName] = useState();
  const roomId = useContext(UserContext).convert_page;
  const {setConvertPage} = useContext(UserContext);
  const navigate = useNavigate();
  const [init_chat_room, setInitChatRoom] = useState(false);

  console.log('ChatRoom');
  async function SearchRoom() {
    try {
      const rep = await apiManager.get(`/chatroom/join_room?room_id=${roomId}`);
      console.log('ChatRoom.tsx: ', rep.data);
      setRoomName(rep.data?.name);
      setInitChatRoom(true);
    } catch (error) {
      console.log(error);
      alert('비정상 접근입니다');
      setConvertPage(0);
      navigate(-1);
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
