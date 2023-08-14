import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {UserContext} from '../MainLayout/Context';
import {DmChat, DmListData} from '@/types/UserContext';
import apiManager from '@/api/apiManager';

const Message = ({
  userId,
  message,
  user_id,
}: {
  userId: string;
  message: string;
  user_id: string | null;
}) => {
  const me = userId !== user_id;

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
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default function Dm() {
  const {socket, user_id, block_users} = useContext(UserContext);
  const {dm_list, setDmList} = useContext(UserContext);
  const dm_user_id = useRef<string>('');
  const dm_user_nickname = useRef<string>('');
  // 리스트에 사용자가 추가되어있는지 확인하는 변수
  const [chats, setChats] = useState<DmChat[]>([]);
  const [message, setMessage] = useState<string>('');
  const chat_scroll = useRef<HTMLDivElement>(null);
  const list_scroll = useRef<HTMLDivElement>(null);
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);
  const [textFieldDisabled, setTextFieldDisabled] = useState(false);
  const [notify, setNofify] = useState<Map<string, number>>(new Map());

  console.log('DmPage');

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message || !socket || !dm_user_id.current) {
        return;
      }
      if (block_users.has(dm_user_id.current)) {
        alert('차단을 해제해주세요.');
        return;
      }
      socket?.emit(
        'dm-message',
        {target_id: dm_user_id.current, message},
        (chat: DmChat) => {
          setChats(prevChats => [...prevChats, chat]);
        }
      );
      setMessage('');
    },
    [message, socket, block_users]
  );

  async function changeUser(e: React.MouseEvent<unknown>, row: DmListData) {
    if (dm_user_id.current === row.user2) {
      return;
    }
    const rep = await apiManager.get('chatroom/dm', {
      params: {
        user_id: row.user1,
        other_id: row.user2,
      },
    });
    dm_user_id.current = row.user2;
    dm_user_nickname.current = row.nickname;
    setChats(rep.data);
    setMessage('');
    setNofify(prev => {
      const new_notify = new Map(prev);
      new_notify.set(row.user2, 0);
      return new_notify;
    });
    if (block_users.has(`${dm_user_id.current}`)) {
      setTextFieldDisabled(true);
      return;
    }
    setTextFieldDisabled(false);
  }

  async function init() {
    try {
      const rep = await apiManager.get('chatroom/dm_list', {
        params: {
          user_id: user_id,
        },
      });
      setDmList(rep.data);
    } catch (error) {
      console.log('List.tsx: ', error);
    }
  }

  function handleDmMessage(chat: DmChat) {
    if (chat.userId === dm_user_id.current && chat.someoneId === user_id) {
      setChats(prevChats => [...prevChats, chat]);
    }
    setNofify(prev => {
      const new_notify = new Map(prev);
      const cnt = new_notify.get(chat.userId);
      cnt !== undefined
        ? new_notify.set(chat.userId, cnt + 1)
        : new_notify.set(chat.userId, 1);
      return new_notify;
    });

    setDmList(prev => {
      if (prev.some(item => item.user2 === chat.userId)) {
        return prev;
      }
      return [
        ...prev,
        {
          user1: chat.someoneId,
          user2: chat.userId,
          nickname: chat.nickname,
        },
      ];
    });
  }

  function handleBlock() {
    if (block_users.has(dm_user_id.current)) {
      setTextFieldDisabled(true);
      return;
    }
    setTextFieldDisabled(false);
  }

  function notiBage(row: DmListData) {
    const cnt = notify.get(row.user2);
    if (cnt !== undefined && cnt > 0) {
      return (
        <>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Typography>{`${row.nickname}`}</Typography>
            <Typography sx={{color: 'red'}}>{`${cnt}`}</Typography>
            {/* <CircleIcon sx={{color: 'red'}} /> */}
          </Box>
        </>
      );
    }
    return <Typography>{`${row.nickname}`}</Typography>;
  }

  useEffect(() => {
    init();
    socket?.on('block-list', handleBlock);
    socket?.on('dm-message', handleDmMessage);

    return () => {
      socket?.off('block-list', handleBlock);
      socket?.off('dm-message', handleDmMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (!chat_scroll.current) return;

    const chatContainer = chat_scroll.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [chats.length]);

  useEffect(() => {
    if (!list_scroll.current) return;

    const chatContainer = list_scroll.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [dm_list.length]);

  return (
    <>
      <Box display={'flex'}>
        {/*  Chat */}
        <Box
          overflow={'auto'}
          minWidth={'400px'}
          height={'400px'}
          border={'1px solid black'}
        >
          <Box border={'1px solid black'}>
            <Typography ml={'10px'}>{dm_user_nickname.current}</Typography>
          </Box>
          <Box
            sx={{
              height: '90%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box ref={chat_scroll} sx={{flexGrow: 1, overflow: 'auto'}}>
              {chats.map((message_node, index) => (
                <Message
                  message={message_node.message}
                  userId={message_node.userId}
                  user_id={user_id}
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
                  disabled={textFieldDisabled}
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
        </Box>
        <Box
          overflow={'auto'}
          minWidth={'150px'}
          height={'400px'}
          border={'1px solid black'}
        >
          {/* List */}
          <Table>
            <TableBody>
              {dm_list?.map((row, index) => {
                return (
                  <TableRow key={index} onClick={e => changeUser(e, row)}>
                    <TableCell>
                      {/* 알람 추가 */}
                      {notiBage(row)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </>
  );
}
