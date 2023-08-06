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
import {UserContext} from 'Context';
import apiManager from '@apiManager/apiManager';

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
  const {socket, user_id} = useContext(UserContext);
  const [list, setList] = useState<Array<DmListData>>([]);
  const dm_user = useRef<string>('');
  const [chats, setChats] = useState<DmChat[]>([]);
  const [message, setMessage] = useState<string>('');

  const chat_scroll = useRef<HTMLDivElement>(null);
  const list_scroll = useRef<HTMLDivElement>(null);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const onSendMessage = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!message || !socket || !dm_user.current) {
        return;
      }
      socket?.emit(
        'dm-message',
        {target_id: dm_user.current, message},
        (chat: DmChat) => {
          setChats(prevChats => [...prevChats, chat]);
        }
      );
      setMessage('');
    },
    [message, socket]
  );

  async function changeUser(e: React.MouseEvent<unknown>, row: DmListData) {
    if (dm_user.current === row.user2) {
      return;
    }
    const rep = await apiManager.get('chatroom/dm', {
      params: {
        user_id: row.user1,
        other_id: row.user2,
      },
    });
    dm_user.current = row.user2;

    setChats(rep.data);
    setMessage('');
  }

  async function init() {
    try {
      const rep = await apiManager.get('chatroom/dm_list', {
        params: {
          user_id: user_id,
        },
      });
      setList(rep.data);
    } catch (error) {
      console.log('List.tsx: ', error);
    }
  }

  function handleDmMessage(chat: DmChat) {
    if (chat.userId === dm_user.current && chat.someoneId === user_id) {
      setChats(prevChats => [...prevChats, chat]);
    }
  }

  useEffect(() => {
    init();
    socket?.on('dm-message', handleDmMessage);
  }, []);

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
  }, [list.length]);

  return (
    <>
      <Box display={'flex'}>
        {/*  Chat */}
        {/* <Chat /> */}
        <Box
          overflow={'auto'}
          minWidth={'400px'}
          height={'400px'}
          border={'1px solid black'}
        >
          <Box border={'1px solid black'}>
            <Typography ml={'10px'}>{dm_user.current}</Typography>
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
          {/* <List /> */}
          <Table>
            <TableBody>
              {list?.map((row, index) => {
                return (
                  <TableRow key={index} onClick={e => changeUser(e, row)}>
                    <TableCell>
                      <Typography>{`${row.user2}`}</Typography>
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
