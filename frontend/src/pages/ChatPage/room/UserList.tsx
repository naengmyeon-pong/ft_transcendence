import apiManager from '@apiManager/apiManager';
import {Box, Button, Typography, styled} from '@mui/material';
import {UserContext} from 'Context';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import ChatInvite from '../modal/ChatInvite';
import UserNode from './menu/UserNode';

const BoxBorder = styled('div')({
  border: '1px solid black',
  borderRadius: '5px',
});

export default function UserList() {
  const [owner, setOwner] = useState<UserType>();
  const [adminUser, setAdminUser] = useState<UserType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [inviteModal, setInviteModal] = useState<boolean>(false);

  const socket = useContext(UserContext).socket;

  const {roomId} = useParams();

  const navigate = useNavigate();

  async function roomUsers() {
    try {
      const rep = await apiManager.get(
        `/chatroom/room_members/?room_id=${roomId}`
      );
      setOwner(rep.data?.owner);
      setAdminUser(rep.data?.admin);
      setUsers(rep.data?.user);
    } catch (error) {
      alert('존재하지 않는 채팅방입니다');
      navigate('/menu/chat/list');
      console.log(error);
      // TODO: 벤유저가 들어왔을 경우
    }
  }

  function handleInvite() {
    setInviteModal(true);
  }

  function handleInviteClose() {
    setInviteModal(false);
  }

  function exit() {
    socket?.emit('leave-room', roomId, () => {
      navigate('/menu/chat/list');
    });
  }

  function handleUserList(test: boolean) {
    console.log('TEST');
    console.log(test);
  }

  useEffect(() => {
    // 소켓 이벤트 등록해서 들어온 메세지 헨들링
    socket?.on('test', handleUserList);
    roomUsers();
  }, []);

  return (
    <>
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
            return <UserNode key={index} user={node} />;
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
            return <UserNode key={index} user={node} />;
          })}
        </ul>
      </BoxBorder>
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={handleInvite}>초대하기</Button>
        <Button onClick={exit}>나가기</Button>
      </Box>
      {inviteModal && (
        <ChatInvite
          inviteModal={inviteModal}
          handleInviteClose={handleInviteClose}
        />
      )}
    </>
  );
}
