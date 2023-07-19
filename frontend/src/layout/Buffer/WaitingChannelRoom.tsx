import React from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Socket, io} from 'socket.io-client';

const StyledBadge = styled(Badge)(({theme}) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'grey',
    color: 'grey',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

/*
  message API
  {
    roomName:
    message:
  }
*/
interface IChat {
  username: string;
  message: string;
}

// const Message = (message: IChat, username: String) => {
const Message = ({
  message,
  username,
}: {
  message: IChat;
  username: string | undefined;
}) => {
  const me = message.username !== username;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: me ? 'flex-start' : 'flex-end',
        mb: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          backgroundColor: me ? '#898da3' : '#2196f3',
          borderRadius: me ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
        }}
      >
        <Typography variant="body1" color={'white'}>
          {message.message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default function WaitingChannelRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<IChat[]>([]);
  const [message, setMessage] = useState<string>('');
  const room_name = 'main_room';

  // chatContainerEl: 채팅창 스크롤을 제어하는 변수
  const chatContainerEl = useRef<HTMLDivElement>(null);

  // 채팅이 길어지면(chats.length) 스크롤이 생성되므로, 스크롤의 위치를 최근 메시지에 위치시키기 위함
  useEffect(() => {
    if (!chatContainerEl.current) return;

    const chatContainer = chatContainerEl.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  // message event listener

  useEffect(() => {
    const socketIo = io('http://localhost:4000/chat');

    socketIo.emit('join-room', room_name);

    // 초기 서버로부터 채팅기록 가져와서 저장
    function messageHandler(chat: IChat) {
      setChats(prevChats => [...prevChats, chat]);
    }

    socketIo.on('message', messageHandler);
    setSocket(socketIo);
    return () => {
      socketIo.off('message', messageHandler);
    };
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      //form은 submit 후에 페이지를 새로고침함, 방지하기 위해 사용됨
      e.preventDefault();
      if (!message) {
        return alert('메시지를 입력해 주세요.');
      }
      if (!socket) {
        return alert('소켓가 발생했습니다.');
      }

      socket.emit('message', {roomName: room_name, message}, (chat: IChat) => {
        setChats(prevChats => [...prevChats, chat]);
        setMessage('');
      });
    },
    [message, socket]
  );
  return (
    <Box
      sx={{
        mt: '10px',
        height: '30vh',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        border: 1,
      }}
    >
      <Box>
        {/* 1:1채팅 맨 위 상단 */}
        <Box display="flex">
          <Box sx={{p: 2}}>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
              variant="dot"
            >
              <Avatar alt="friend profile memo" src="/logo.jpeg" />
            </StyledBadge>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-around"
          >
            <Typography>{'username'}</Typography>
            <Typography>{'오프라인'}</Typography>
          </Box>
        </Box>
      </Box>
      {/* 채팅창 메세지 */}
      <Box
        ref={chatContainerEl}
        sx={{flexGrow: 1, overflow: 'auto', bgcolor: 'grey.200'}}
      >
        {chats.map((message_node, index) => (
          <Message
            message={message_node}
            username={socket?.id.toString()}
            key={index}
          />
        ))}
      </Box>
      {/* 채팅 입력창 */}
      <Box>
        <form onSubmit={onSendMessage}>
          {/* <Grid container sx={{ width: "100%" }}>
            <Grid item sx={{ width: "100%" }}> */}
          <TextField
            fullWidth
            size="small"
            placeholder="메세지를 입력하세요"
            variant="outlined"
            value={message}
            onChange={onChange}
            sx={{backgroundColor: 'white'}}
          />
          <Button
            sx={{display: 'none'}}
            type="submit"
            size="large"
            color="primary"
            variant="contained"
          >
            Send
          </Button>
        </form>
      </Box>
    </Box>
  );
}
