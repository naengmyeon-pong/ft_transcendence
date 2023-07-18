import apiManager from '@apiManager/apiManager';
import {Box, Button, Grid, TextField, Typography} from '@mui/material';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
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
  const [message, setMessage] = useState<string>('');

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const navigator = useNavigate();

  async function roomUsers() {
    try {
      const rep = await apiManager.get(`http://localhost:3003/${roomName}`);
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

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      //form은 submit 후에 페이지를 새로고침함, 방지하기 위해 사용됨
      e.preventDefault();
      if (!message) {
        return alert('메시지를 입력해 주세요.');
      }
      console.log(message);
      // if (!socket) {
      //   return alert('소켓가 발생했습니다.');
      // }
      // 매개변수, event, <string> | <symbol>
      // symbol: 반환값을 처리하는 객체
      // socket.emit('message', {roomName: room_name, message}, (chat: IChat) => {
      //   setChats(prevChats => [...prevChats, chat]);
      //   setMessage('');
      // });
    },
    [message]
    // [message, socket]
  );

  useEffect(() => {
    roomUsers();
  }, []);

  return (
    <>
      {/* <Box display="flex" justifyContent="center"> */}
      <Grid container spacing={2}>
        {/* 채팅창 구역*/}
        <Grid item xs={7}>
          <Box border={1} sx={{backgroundColor: '#e0e0e0'}}>
            <Typography variant="body1">{roomName}</Typography>
          </Box>
          <Box border={1} height={345}>
            <Typography>안녕하세요 여러분</Typography>
            <Typography>반갑습니다. 저도 관리자 할 수 있나요?</Typography>
            <Typography>
              관리자는 구독 회원만 가능합니다. 구독 회원이 되려면 빙글맨 유튜브
              구독, 좋아요, 알람 설정 인증 부탁드립니다.
            </Typography>
          </Box>
          <Box>
            <form onSubmit={onSendMessage}>
              {/* <Grid container sx={{ width: "100%" }}>
            <Grid item sx={{ width: "100%" }}> */}
              <TextField
                fullWidth
                placeholder="메세지를 입력하세요"
                variant="outlined"
                value={message}
                onChange={onChange}
                sx={{backgroundColor: 'white'}}
              />
              <Button
                sx={{display: 'none'}}
                type="submit"
                // fullWidth
                size="large"
                color="primary"
                variant="contained"
              >
                Send
              </Button>
            </form>
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
            <Button>초대하기</Button>
            <Button>나가기</Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
export default ChatRoom;
