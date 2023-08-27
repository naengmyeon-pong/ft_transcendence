import {Box, Button, TextField, Typography} from '@mui/material';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import * as HTTP_STATUS from 'http-status';

import {UserContext} from '../../Context';
import {DmChat} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {dmUserInfo} from '@/states/dmUser';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import axios from 'axios';
import {tokenExpiredExit} from '@/states/tokenExpired';
import DMPrint from './DMPrint';

export default function DMUser() {
  const {chat_socket, user_id, block_users} = useContext(UserContext);
  const [dm_user, setDmUser] = useRecoilState(dmUserInfo);
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);

  const [chats, setChats] = useState<DmChat[]>([]);
  const [message, setMessage] = useState<string>('');
  const [textFieldDisabled, setTextFieldDisabled] = useState(false);

  const chat_scroll = useRef<HTMLDivElement>(null);
  // 클로저 문제 때문에 사용함
  const dm_user_id = useRef<string>('');
  const dm_user_nickname = useRef<string>('');

  function closeDirectMessage() {
    setDmUser(null);
  }

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message || !chat_socket || !dm_user_id.current) {
        return;
      }
      if (block_users.has(dm_user_id.current)) {
        alert('차단을 해제해주세요.');
        return;
      }
      chat_socket?.emit(
        'dm-message',
        {target_id: dm_user_id.current, message},
        (chat: DmChat) => {
          setChats(prevChats => [...prevChats, chat]);
        }
      );
      setMessage('');
    },
    [message, chat_socket, block_users]
  );

  const changeUser = useCallback(async () => {
    try {
      if (dm_user !== null) {
        const rep = await apiManager.get('dm', {
          params: {
            user_id: user_id,
            other_id: dm_user?.id,
          },
        });

        dm_user_id.current = dm_user?.id;
        dm_user_nickname.current = dm_user?.nickName;
        setChats(rep.data);
        setMessage('');
        if (block_users.has(`${dm_user_id.current}`)) {
          setTextFieldDisabled(true);
          return;
        }
        setTextFieldDisabled(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  }, [
    dm_user,
    user_id,
    block_users,
    openAlertSnackbar,
    setTextFieldDisabled,
    setTokenExpiredExit,
  ]);

  const handleDmMessage = useCallback(
    async (chat: DmChat) => {
      if (chat.userId === dm_user_id.current && chat.someoneId === user_id) {
        setChats(prevChats => [...prevChats, chat]);
      }
    },
    [user_id]
  );

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  const handleBlock = useCallback(() => {
    if (block_users.has(dm_user_id.current)) {
      setTextFieldDisabled(true);
      return;
    }
    setTextFieldDisabled(false);
  }, [block_users]);

  useEffect(() => {
    chat_socket?.on('block-list', handleBlock);
    chat_socket?.on('dm-message', handleDmMessage);

    return () => {
      chat_socket?.off('block-list', handleBlock);
      chat_socket?.off('dm-message', handleDmMessage);
    };
  }, [chat_socket, handleDmMessage, handleBlock]);

  useEffect(() => {
    if (!chat_scroll.current) return;

    const chatContainer = chat_scroll.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  useEffect(() => {
    if (dm_user !== null && user_id !== null) {
      changeUser();
    }
  }, [dm_user, changeUser, user_id]);

  return (
    <>
      <Box
        overflow={'auto'}
        width={'350'}
        height={'400px'}
        border={'1px solid black'}
      >
        <Box border={'1px solid black'} height={'19%'} display={'flex'}>
          <Button onClick={closeDirectMessage}>
            <ArrowBackIosIcon />
          </Button>
          <Typography maxHeight={'auto'} ml={'10px'}>
            {dm_user_nickname.current}
          </Typography>
        </Box>
        <Box
          sx={{
            height: '80%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DMPrint chat_scroll={chat_scroll} chats={chats} />

          {/* 채팅 입력창 */}
          <Box>
            <form onSubmit={onSendMessage}>
              <TextField
                disabled={textFieldDisabled}
                fullWidth
                size="small"
                placeholder="메세지를 입력하세요"
                variant="outlined"
                value={message}
                onChange={onChange}
                sx={{backgroundColor: 'white'}}
                autoComplete="off"
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
      </Box>
    </>
  );
}
