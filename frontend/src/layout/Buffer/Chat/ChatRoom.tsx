import apiManager from '@apiManager/apiManager';
import {Box, Button, Grid, List, ListItem, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

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
  const navigator = useNavigate();

  async function roomUsers() {
    try {
      const rep = await apiManager.get(
        `https://0c369f19-3747-4af6-ada3-eb3c9d3921b0.mock.pstmn.io/${roomName}`
      );
      setOwner(rep.data?.owner);
      setAdminUser(rep.data?.adminUser);
      setUsers(rep.data?.users);
    } catch (error) {
      // TODO: 없는 채팅방으로 들어왔을 경우
      alert('존재하지 않는 채팅방입니다');
      navigator('/menu/chatList');
      console.log(error);
      // TODO: 벤유저가 들어왔을 경우
    }
  }
  console.log('owner: ', owner);
  console.log('adminUser: ', adminUser);
  console.log('users: ', users);
  useEffect(() => {
    roomUsers();
  }, []);

  return (
    <>
      {/* <Box display="flex" justifyContent="center"> */}
      <Grid container spacing={2}>
        {/* 채팅창 구역*/}
        <Grid item xs={7}>
          <Typography variant="body1">{roomName}</Typography>
          <Box>
            <Typography>안녕하세요 여러분</Typography>
            <Typography>반갑습니다. 저도 관리자 할 수 있나요?</Typography>
            <Typography>
              관리자는 구독 회원만 가능합니다. 구독 회원이 되려면 빙글맨 유튜브
              구독, 좋아요, 알람 설정 인증 부탁드립니다.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <Box>
              <Typography variant="body1">방장: {owner?.nickName}</Typography>
            </Box>
            <Box>
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
            <Box>
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
          </Box>
          <Box display="flex" justifyContent="center">
            <Button>초대하기</Button>
            <Button>나가기</Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
export default ChatRoom;
