import apiManager from '@apiManager/apiManager';
import {Box, Button, Grid, Typography, styled} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import ChatInvite from '../modal/ChatInvite';
import ChatBox from './ChatBox';
import UserList from './menu/UserList';

const BoxBorder = styled('div')({
  border: '1px solid black',
  borderRadius: '5px',
});

// 채팅방에 입장해서 실행하는 컴포넌트
function ChatRoom() {
  const {roomName} = useParams();
  const [owner, setOwner] = useState<UserType>();
  const [adminUser, setAdminUser] = useState<UserType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [inviteModal, setInviteModal] = useState<boolean>(false);

  const navigate = useNavigate();

  async function roomUsers() {
    try {
      const rep = await apiManager.get(
        `/chatroom/room_members/?room_id=${roomName}`
      );
      setOwner(rep.data?.owner);
      setAdminUser(rep.data?.admin);
      setUsers(rep.data?.user);
    } catch (error) {
      // TODO: 없는 채팅방으로 들어왔을 경우
      alert('존재하지 않는 채팅방입니다');
      navigate('/menu/chat/list');
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

  function exit() {
    navigate('/menu/chat/list');
  }

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
          <BoxBorder style={{backgroundColor: '#e0e0e0'}}>
            <Typography variant="body1">방장: {owner?.nickName}</Typography>
          </BoxBorder>
          <BoxBorder style={{height: '200px'}}>
            <Typography variant="body1" ml={'10px'}>
              채팅방 관리자
            </Typography>
            {/* 나를 제외한 관리자 유저 등급 출력 */}
            <ul style={{marginTop: '5px', width: 'auto'}}>
              {adminUser?.map((node, index) => {
                return <UserList key={index} user={node} />;
              })}
            </ul>
          </BoxBorder>
          <BoxBorder style={{height: '200px'}}>
            <Typography variant="body1" ml={'10px'}>
              채팅 참여자
            </Typography>
            {/* 나를 제외한 일반 유저 등급 */}
            <ul>
              {users?.map((node, index) => {
                return <UserList key={index} user={node} />;
              })}
            </ul>
          </BoxBorder>
          <Box display="flex" justifyContent="flex-end">
            <Button onClick={handleInvite}>초대하기</Button>
            <Button onClick={exit}>나가기</Button>
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
