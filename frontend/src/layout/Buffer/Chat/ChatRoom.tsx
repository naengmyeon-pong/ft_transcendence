import apiManager from '@apiManager/apiManager';
import {Box, Button, Grid, TextField, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import ChatInvite from './ChatInvite';
import ChatBox from '../ChatBox';

interface UserType {
  nickName: string;
  intraId: string;
  userImage: string;
}

// 채팅방에 입장해서 실행하는 컴포넌트
function ChatRoom() {
  const {roomName} = useParams();
  const [owner, setOwner] = useState<UserType>();
  const [adminUser, setAdminUser] = useState<UserType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [inviteModal, setInviteModal] = useState<boolean>(false);

  const navigator = useNavigate();

  async function roomUsers() {
    try {
      const rep = await apiManager.get(`http://localhost:3003/${roomName}`);
      setOwner(rep.data?.owner);
      setAdminUser(rep.data?.adminUser);
      setUsers(rep.data?.users);
      console.log(rep.data);
    } catch (error) {
      // TODO: 없는 채팅방으로 들어왔을 경우
      alert('존재하지 않는 채팅방입니다');
      navigator('/menu/chatList');
      console.log(error);
      // TODO: 벤유저가 들어왔을 경우
    }
  }

  useEffect(() => {
    roomUsers();
  }, []);

  function handleInvite() {
    setInviteModal(true);
  }

  function handleInviteClose() {
    setInviteModal(false);
  }

  return (
    <>
      {/* <Box display="flex" justifyContent="center"> */}
      <Grid container spacing={2}>
        {/* 채팅창 구역*/}
        <Grid item xs={7}>
          <Box border={1} sx={{backgroundColor: '#e0e0e0'}}>
            <Typography variant="body1">{roomName}</Typography>
          </Box>
          <Box border={1} height={400}>
            {/* 채팅창영역 */}
            <ChatBox />
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box border={1} sx={{backgroundColor: '#e0e0e0'}}>
            <Typography variant="body1">방장: {owner?.nickName}</Typography>
          </Box>
          <Box border={1} height={200}>
            <Typography variant="body1">채팅방 관리자</Typography>
            <ul>
              {/* <ListItem> */}
              {adminUser.map(node => {
                return (
                  // <ListItem key={node.nickName}>
                  <li key={node.nickName}>{node.nickName}</li>
                  // {/* <Typography variant="body2"></Typography> */}
                  // </ListItem>
                );
              })}
            </ul>
          </Box>
          <Box border={1} height={200}>
            <Typography variant="body1">채팅 참여자</Typography>
            <ul>
              {/* <ListItem> */}
              {users.map(node => {
                return (
                  // <ListItem key={node.nickName}>
                  <li key={node.nickName}>{node.nickName}</li>
                  // {/* <Typography variant="body2"></Typography> */}
                  // </ListItem>
                );
              })}
            </ul>
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={handleInvite}>초대하기</Button>
            <Button>나가기</Button>
          </Box>
          {inviteModal ? (
            <ChatInvite
              inviteModal={inviteModal}
              handleInviteClose={handleInviteClose}
            />
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    </>
  );
}
export default ChatRoom;
