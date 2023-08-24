'use client';
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import * as HTTP_STATUS from 'http-status';
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  List,
  Modal,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SearchIcon from '@mui/icons-material/Search';
import Profile from './Profile';
import {useState} from 'react';
import {UserContext} from '../Context';
import {DmChat, UserType} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import FriendList from './FriendList';
import BlockUserList from './BlockUserList';
import {modalStyle} from '@/components/styled/modalStyle';
import {drawerWidth} from '@/constants/sidebar';
import Dm from './DM';
import {useRecoilState, useRecoilValue} from 'recoil';
import {dmBadgeCnt, profileDMChoise} from '@/states/userContext';
import {dmList, dmNotify, dmUserInfo} from '@/states/dmUser';
import axios from 'axios';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useSetRecoilState} from 'recoil';
import {tokenExpiredExit} from '@/states/tokenExpired';

function SideBar() {
  console.log('SideBar');

  // lstState: 0 = 차단 목록, 1 = 친구 목록, 2 = DM
  const [lstState, setLstState] = useState(1);
  const {chat_socket, block_users, user_id} = useContext(UserContext);

  const [block_users_size, setBlockUsersSize] = useState<number>(0);

  const [friend_list, setFriendList] = useState<UserType[]>([]);
  const [friend_modal, setFriendModal] = useState<boolean>(false);
  const [friend_name, setFriendName] = useState<string>('');
  const [friend_search_list, setFriendSearchList] = useState<UserType[]>([]);
  const [profile_dm_choise, setDmChoise] = useRecoilState(profileDMChoise);
  const [dm_badge_value, setDMBadge] = useRecoilState(dmBadgeCnt);
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);
  const [notify, setNofify] = useRecoilState(dmNotify);

  const dm_user = useRecoilValue(dmUserInfo);
  const dm_user_id = useRef<string>('');

  const lstState_ref = useRef<number>(lstState);
  lstState_ref.current = lstState;

  function friendListTap() {
    if (lstState === 1) {
      return;
    }
    setLstState(1);
  }

  function blockUserListTap() {
    if (lstState === 0) {
      return;
    }
    setLstState(0);
  }

  function directMessageUserListTap() {
    if (lstState === 2) {
      return;
    }
    setLstState(2);
  }

  function handleFriendModalClose() {
    setFriendName('');
    setFriendSearchList([]);
    setFriendModal(false);
  }

  async function handleFriendSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const rep = await apiManager.get('chatroom/search_user', {
        params: {
          user_id: user_id,
          user_nickname: friend_name,
        },
      });
      setFriendSearchList(rep.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  }

  function listInModal() {
    const filter_search_list = friend_search_list.filter(
      searchUser => !friend_list.some(friend => friend.id === searchUser.id)
    );
    return (
      <>
        {filter_search_list.map((row, index) => {
          return (
            <Box key={index} display={'flex'}>
              <Avatar src={`${row.image}`} />
              <Typography>{row.nickName}</Typography>
              <Button
                // disabled={friend_list.find() ? true : false}
                onClick={() => chat_socket?.emit('add-friend', row.id)}
              >
                친구 추가
              </Button>
            </Box>
          );
        })}
      </>
    );
  }

  const handleDMCnt = useCallback(
    (chat: DmChat) => {
      console.log('lstState: ', lstState);
      if (lstState_ref.current !== 2 || dm_user_id.current !== chat.userId) {
        setDMBadge(prev => prev + 1);
      }
      setNofify(prev => {
        if (dm_user_id.current === chat.userId) {
          return prev;
        }
        const new_notify = new Map(prev);
        const cnt = new_notify.get(chat.userId);
        cnt !== undefined
          ? new_notify.set(chat.userId, cnt + 1)
          : new_notify.set(chat.userId, 1);
        return new_notify;
      });
    },
    [lstState, setDMBadge, setNofify]
  );

  useEffect(() => {
    if (dm_user !== null) {
      dm_user_id.current = dm_user?.id;
    }
  }, [dm_user]);

  useEffect(() => {
    chat_socket?.on('dm-message', handleDMCnt);
    return () => {
      chat_socket?.off('dm-message', handleDMCnt);
    };
  }, [handleDMCnt, chat_socket]);

  //friendlist 갱신
  useEffect(() => {
    chat_socket?.on('update-friend-state', ({userId, state}) => {
      console.log(`userId : ${userId}, state :${state}`);
      setFriendList(prev => {
        const tmp_list: UserType[] = [];
        prev.forEach(friend => {
          if (friend.id === userId) {
            friend.state = state;
          }
          tmp_list.push(friend);
        });
        return tmp_list;
      });
    });
    return () => {
      chat_socket?.off('update-friend-state');
    };
  }, []);

  useEffect(() => {
    function handleBlockList() {
      setBlockUsersSize(block_users.size);
      chat_socket?.emit('friend-list');
    }

    function handleFriendList(res: UserType[]) {
      console.log('res: ', res);
      setFriendList(res);
    }
    setBlockUsersSize(block_users.size);

    chat_socket?.on('friend-list', handleFriendList);
    chat_socket?.on('block-list', handleBlockList);
    chat_socket?.emit('friend-list');

    return () => {
      chat_socket?.off('friend-list', handleFriendList);
      chat_socket?.off('block-list', handleBlockList);
    };
  }, []);

  useEffect(() => {
    if (profile_dm_choise === true) {
      setDmChoise(false);
      setLstState(2);
    }
  }, [profile_dm_choise, setDmChoise, handleDMCnt]);

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          ['& .MuiDrawer-paper']: {
            width: drawerWidth,
            // boxSizing: 'border-box',
          },
          display: 'block',
        }}
      >
        <Toolbar />
        <Box sx={{overflow: 'auto'}}>
          <Box
            sx={{
              p: '5px',
            }}
          >
            <Profile />
          </Box>
          <Divider />
          <Box
            display="flex"
            sx={{
              justifyContent: 'center',
              py: '1em',
            }}
          >
            <ButtonGroup>
              <Button
                variant={lstState === 0 ? 'contained' : 'outlined'}
                onClick={blockUserListTap}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState === 0 ? 'white' : 'black',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  <Typography>차단 목록</Typography>
                  <Typography>{`${block_users_size}`}</Typography>
                </Box>
              </Button>
              <Button
                variant={lstState === 1 ? 'contained' : 'outlined'}
                onClick={friendListTap}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState === 1 ? 'white' : 'black',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  <Typography>친구 목록</Typography>
                  <Typography>{`${friend_list.length}`}</Typography>
                </Box>
              </Button>
              <Button
                variant={lstState === 2 ? 'contained' : 'outlined'}
                onClick={directMessageUserListTap}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState === 2 ? 'white' : 'black',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  {/* <Badge
                    overlap="circular"
                    color="error"
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    badgeContent={dm_badge_value}
                  > */}
                  <Typography width={'60px'}>DM</Typography>
                  {/* </Badge> */}
                </Box>
              </Button>
            </ButtonGroup>
          </Box>

          <Box display="flex" sx={{justifyContent: 'center', p: '0.5em'}}>
            {/* 친구 찾기 */}
            <IconButton onClick={() => setFriendModal(true)}>
              <PersonAddAlt1Icon sx={{color: 'black'}} />
            </IconButton>
          </Box>
          <Modal open={friend_modal} onClose={handleFriendModalClose}>
            <Box sx={modalStyle}>
              <FormControl fullWidth>
                <Typography variant="h4">친구 찾기</Typography>
                <Typography variant="body1">
                  닉네임으로 검색 가능합니다
                </Typography>
                <Box component={'form'} onSubmit={handleFriendSearch}>
                  <TextField
                    margin="normal"
                    fullWidth
                    variant="outlined"
                    value={friend_name}
                    onChange={e => setFriendName(e.target.value)}
                    sx={{backgroundColor: 'white'}}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button type="submit" sx={{display: 'none'}} />
                  {/* TODO: 검색 조회 결과를 작성할 공간 */}
                  {listInModal()}
                  <Button onClick={handleFriendModalClose}>닫기</Button>
                </Box>
              </FormControl>
            </Box>
          </Modal>
          {/* true: 친구 목록, flase: 차단 목록 */}
          {lstState === 1 ? (
            <List>
              {friend_list.map((node, index) => {
                return <FriendList key={index} friend={node} />;
              })}
            </List>
          ) : lstState === 0 ? (
            <List>
              {Array.from(block_users.values()).map((node, index) => {
                return <BlockUserList key={index} block_user={node} />;
              })}
            </List>
          ) : (
            <Dm />
          )}
          <Divider />
        </Box>
      </Drawer>
    </>
  );
}
export default SideBar;
