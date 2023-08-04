import {CleaningServices, NavigateBefore} from '@mui/icons-material';
import {Avatar, Box, Button, Paper, TextField, Typography} from '@mui/material';
import {UserContext} from 'Context';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Socket} from 'socket.io-client';
import MuteModal from '../modal/MuteModal';

interface IChat {
  user_id: string;
  user_image: string;
  user_nickname: string;
  message: string;
}

const Message = ({user_image, user_nickname, message}: IChat) => {
  return (
    <Box
      sx={{
        display: 'flex',
        //   justifyContent: me ? 'flex-start' : 'flex-end',
        //   mb: 2,
      }}
    >
      <Avatar src={user_image} sx={{margin: '10px'}} />

      <Typography sx={{margin: '20px'}}>{user_nickname}</Typography>
      <Typography sx={{margin: '20px'}}>{message}</Typography>
      {/* <Typography sx={{margin: '20px'}}>{message.message}</Typography> */}

      {/* <Paper
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
      </Paper> */}
    </Box>
  );
};

function ChatBox() {
  const {socket} = useContext(UserContext);
  const {block_users} = useContext(UserContext);
  const {setConvertPage} = useContext(UserContext);

  const [chats, setChats] = useState<IChat[]>([]);
  const [message, setMessage] = useState<string>('');
  const [muteTimer, setMuteTimer] = useState<number>(0);
  const [muteModal, setMuteModal] = useState<boolean>(false);

  // const {roomId} = useParams();
  const roomId = sessionStorage.getItem('room_id');

  // 채팅창 스크롤을 제어하는 변수
  const chatContainerEl = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // 채팅이 길어지면(chats.length) 스크롤이 생성되므로, 스크롤의 위치를 최근 메시지에 위치시키기 위함
  useEffect(() => {
    if (!chatContainerEl.current) return;

    const chatContainer = chatContainerEl.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  // const navigate = useNavigate();

  useEffect(() => {
    socket?.emit('join-room', roomId, (res: boolean) => {
      if (res === false) {
        navigate(-1);
        alert('에러가 발생하였습니다.');
      }
    });

    const handleListener = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // e.returnValue = '';
      socket?.emit('leave-room', {room_id: roomId});
      sessionStorage.removeItem('room_id');
      setConvertPage(0);
    };

    function handleMute(mute_time: number) {
      setMuteTimer(mute_time);
    }

    function handleMessage(chat: IChat) {
      if (block_users?.has(chat.user_id)) {
        return;
      }
      setChats(prevChats => [...prevChats, chat]);
    }

    window.addEventListener('beforeunload', handleListener);
    socket?.on('mute-member', handleMute);
    socket?.on('message', handleMessage);

    function leaveRoomHandler(ret: boolean) {
      // navigate('/menu/chat/list');
      navigate('/menu/chat');
    }

    socket?.once('leave-room', leaveRoomHandler);

    socket?.once('kick-member', () => {
      socket?.emit('leave-room', {room_id: roomId}, () => {
        navigate(-1);
      });
    });

    return () => {
      window.removeEventListener('beforeunload', handleListener);
      socket?.emit('leave-room', {room_id: roomId});
      socket?.off('message', handleMessage);
      socket?.off('mute_time', handleMute);
      sessionStorage.removeItem('room_id');
      setConvertPage(0);
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
      if (muteTimer !== 0) {
        const five_minute = 5 * 60 * 1000;
        const mute = Math.abs(new Date().getTime() - muteTimer);
        if (five_minute > mute) {
          setMuteModal(true);
          return;
        }
      }
      setMuteModal(false);
      setMuteTimer(0);

      socket.emit('message', {room_id: roomId, message}, (chat: IChat) => {
        setChats(prevChats => [...prevChats, chat]);
        setMessage('');
      });
    },
    [message, socket]
  );

  function handleMuteClose() {
    setMuteModal(false);
  }

  return (
    <>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box ref={chatContainerEl} sx={{flexGrow: 1, overflow: 'auto'}}>
          {chats.map((message_node, index) => (
            <Message
              message={message_node.message}
              user_image={message_node.user_image}
              user_nickname={message_node.user_nickname}
              user_id={message_node.user_id}
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
        {muteModal && (
          <MuteModal
            muteModal={muteModal}
            handleMuteClose={handleMuteClose}
            muteTimer={muteTimer}
          />
        )}
      </Box>
    </>
  );
}

export default ChatBox;
