'use client';
import {Avatar, Box, Button, TextField, Typography} from '@mui/material';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import MuteModal from './modal/MuteModal';
import {UserContext} from '@/components/layout/MainLayout/Context';
import {useRouter} from 'next/router';

interface IChat {
  user_id: string;
  user_image: string;
  user_nickname: string;
  message: string;
}

const Message = ({user_image, user_nickname, message}: IChat) => {
  return (
    <Box display={'flex'}>
      <Avatar src={user_image} sx={{margin: '10px'}} />

      <Typography sx={{margin: '20px'}}>{user_nickname}</Typography>
      <Typography sx={{margin: '20px'}}>{message}</Typography>
    </Box>
  );
};

function ChatBox() {
  const {chat_socket} = useContext(UserContext);
  const {setConvertPage} = useContext(UserContext);

  const [chats, setChats] = useState<IChat[]>([]);
  const [message, setMessage] = useState<string>('');
  const [muteTimer, setMuteTimer] = useState<number>(0);
  const [muteModal, setMuteModal] = useState<boolean>(false);

  const roomId = useContext(UserContext).convert_page;

  // 채팅창 스크롤을 제어하는 변수
  const chatContainerEl = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // 채팅이 길어지면(chats.length) 스크롤이 생성되므로, 스크롤의 위치를 최근 메시지에 위치시키기 위함
  useEffect(() => {
    if (!chatContainerEl.current) return;

    const chatContainer = chatContainerEl.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  useEffect(() => {
    chat_socket?.emit('join-room', roomId, (res: boolean) => {
      if (res === false) {
        router.back();
        alert('해당 채팅방에 입장할 수 없습니다.');
      }
    });

    function handleMute(mute_time: number) {
      setMuteTimer(mute_time);
    }

    function handleMessage(chat: IChat) {
      setChats(prevChats => [...prevChats, chat]);
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    function handleUnload() {
      chat_socket?.emit('leave-room', {room_id: roomId});
      setConvertPage(0);
    }
    window.addEventListener('unload', handleUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);

    chat_socket?.on('mute-member', handleMute);
    chat_socket?.on('message', handleMessage);

    function leaveRoomHandler() {
      setConvertPage(0);
    }

    chat_socket?.once('leave-room', leaveRoomHandler);

    chat_socket?.once('kick-member', () => {
      chat_socket?.emit('leave-room', {room_id: roomId}, () => {
        setConvertPage(0);
      });
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // window.removeEventListener('popstate', handlePopState);
      chat_socket?.emit('leave-room', {room_id: roomId});
      chat_socket?.off('message', handleMessage);
      chat_socket?.off('mute_time', handleMute);
      setConvertPage(0);
    };
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message) {
        return alert('메시지를 입력해 주세요.');
      }
      if (!chat_socket) {
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

      chat_socket.emit('message', {room_id: roomId, message}, (chat: IChat) => {
        setChats(prevChats => [...prevChats, chat]);
        setMessage('');
      });
    },
    [message, chat_socket]
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
