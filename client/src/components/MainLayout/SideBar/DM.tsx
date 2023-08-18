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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {UserContext} from '../Context';
import {DmChat, DmListData, UserType} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {dmList, dmNotify, dmUserInfo} from '@/states/dmUser';
import {dmBadgeCnt} from '@/states/userContext';

const Message = ({
  // 보낸이
  userId,
  message,
  // 유저 아이디
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
  const {chat_socket, user_id, block_users} = useContext(UserContext);
  const [dm_list, setDmList] = useRecoilState(dmList);
  // 클로저 문제 때문에 사용함
  const dm_user_id = useRef<string>('');
  const dm_user_nickname = useRef<string>('');
  // 리스트에 사용자가 추가되어있는지 확인하는 변수
  const [chats, setChats] = useState<DmChat[]>([]);
  const [message, setMessage] = useState<string>('');
  const chat_scroll = useRef<HTMLDivElement>(null);
  const list_scroll = useRef<HTMLDivElement>(null);

  const [textFieldDisabled, setTextFieldDisabled] = useState(false);
  // const [notify, setNofify] = useState<Map<string, number>>(new Map());
  const [notify, setNofify] = useRecoilState(dmNotify);

  // false: List, true: DM
  const [convert_list_dm, setConvertListDM] = useState(false);

  const [dm_user, setDmUser] = useRecoilState(dmUserInfo);

  console.log('DmPage');
  console.log('변경 감지 setDmList: ', dm_list);

  function closeDirectMessage() {
    setConvertListDM(false);
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

  const changeUser = useCallback(
    async (row: DmListData) => {
      const rep = await apiManager.get('chatroom/dm', {
        params: {
          user_id: row.user1,
          other_id: row.user2,
        },
      });
      setDmUser(prev => {
        if (prev?.id === row.user2) {
          return prev;
        }
        return {
          nickName: row.nickname,
          id: row.user2,
          image: '',
        };
      });

      dm_user_id.current = row.user2;
      dm_user_nickname.current = row.nickname;
      setNofify(prev => {
        const new_notify = new Map<string, number>(prev);
        new_notify.set(row.user2, 0);
        return new_notify;
      });
      setChats(rep.data);
      setMessage('');
      setConvertListDM(true);
      if (block_users.has(`${dm_user_id.current}`)) {
        setTextFieldDisabled(true);
        return;
      }
      setTextFieldDisabled(false);
    },
    [block_users, setDmUser, setNofify]
  );

  function handleDmMessage(chat: DmChat) {
    if (chat.userId === dm_user_id.current && chat.someoneId === user_id) {
      setChats(prevChats => [...prevChats, chat]);
    }

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

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
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
          </Box>
        </>
      );
    }
    return <Typography>{`${row.nickname}`}</Typography>;
  }

  useEffect(() => {
    chat_socket?.on('block-list', handleBlock);
    chat_socket?.on('dm-message', handleDmMessage);

    return () => {
      chat_socket?.off('block-list', handleBlock);
      chat_socket?.off('dm-message', handleDmMessage);
    };
  }, [chat_socket]);

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

  useEffect(() => {
    console.log('dm 페이지 감지', dm_user);
    if (dm_user !== null && user_id !== null) {
      changeUser({
        user1: user_id,
        user2: dm_user.id,
        nickname: dm_user.nickName,
      });
    }
  }, [dm_user, changeUser, user_id]);

  return (
    <>
      {/* <Box display={'flex'}> */}
      {convert_list_dm ? (
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
      ) : (
        <Box
          overflow={'auto'}
          minWidth={'150px'}
          height={'400px'}
          border={'1px solid black'}
        >
          <Table>
            <TableBody>
              {dm_list?.map((row, index) => {
                return (
                  <TableRow key={index} onClick={() => changeUser(row)}>
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
      )}
      {/* </Box> */}
    </>
  );
}
