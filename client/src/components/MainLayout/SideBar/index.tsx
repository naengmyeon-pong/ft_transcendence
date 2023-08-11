'use client';
import React, {ChangeEvent, FormEvent, useContext, useEffect} from 'react';
import {
  Avatar,
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
import {UserType} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import FriendList from './FriendList';
import BlockUserList from './BlockUserList';

const style = {
  position: 'absolute',
  top: '40%',
  left: '48%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #FFF',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

function SideBar() {
  console.log('SideBar');
  // lstState: true = 친구목록, flase = 접속 유저
  const [lstState, setLstState] = useState(true);
  const {socket, block_users, user_id} = useContext(UserContext);
  const [block_users_size, setBlockUsersSize] = useState<number>(0);
  const drawerWidth = 240;
  const [friend_list, setFriendList] = useState<UserType[]>([]);
  const [friend_modal, setFriendModal] = useState<boolean>(false);
  const [friend_name, setFriendName] = useState<string>('');
  const [friend_search_list, setFriendSearchList] = useState<UserType[]>([]);

  function friendList() {
    if (lstState === true) {
      return;
    }
    setLstState(!lstState);
  }

  function connectUserList() {
    if (lstState === false) {
      return;
    }
    setLstState(!lstState);
  }

  function connectUserCount() {
    return `${block_users_size}`;
  }

  // TODO: 온라인, 오프라인 나눠서 출력
  function friendListCount() {
    return `${friend_list.length}`;
  }
  function handleFriendName(e: ChangeEvent<HTMLInputElement>) {
    setFriendName(e.target.value);
  }

  function handleFriendModalOpen() {
    setFriendModal(true);
  }

  function handleFriendModalClose() {
    setFriendName('');
    setFriendSearchList([]);
    setFriendModal(false);
  }

  function handleAddFriend(e: React.MouseEvent<unknown>, row: UserType) {
    socket?.emit('add-friend', row.id);
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
      console.log('FtSideBar.tsx: ', error);
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
                onClick={e => handleAddFriend(e, row)}
              >
                친구 추가
              </Button>
            </Box>
          );
        })}
      </>
    );
  }

  useEffect(() => {
    function handleBlockList() {
      setBlockUsersSize(block_users.size);
      socket?.emit('friend-list');
    }

    function handleFriendList(res: UserType[]) {
      setFriendList(res);
    }
    setBlockUsersSize(block_users.size);
    socket?.on('friend-list', handleFriendList);
    socket?.on('block-list', handleBlockList);
    socket?.emit('friend-list');

    return () => {
      socket?.off('friend-list', handleFriendList);
      socket?.off('block-list', handleBlockList);
    };
  }, []);

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            // boxSizing: 'border-box',
          },
          display: {sm: 'block', xs: 'none'},
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
                variant={lstState ? 'contained' : 'outlined'}
                onClick={friendList}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState ? 'white' : 'black',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  <Typography>친구 목록</Typography>
                  <Typography>{friendListCount()}</Typography>
                </Box>
              </Button>
              <Button
                variant={lstState ? 'outlined' : 'contained'}
                onClick={connectUserList}
                sx={{
                  borderRadius: '13px',
                  borderColor: 'black',
                  color: lstState ? 'black' : 'white',
                }}
              >
                <Box display="flex" sx={{flexDirection: 'column'}}>
                  <Typography>차단 목록</Typography>
                  <Typography>{connectUserCount()}</Typography>
                </Box>
              </Button>
            </ButtonGroup>
          </Box>

          <Box display="flex" sx={{justifyContent: 'center', p: '0.5em'}}>
            {/* 친구 찾기 */}
            <IconButton onClick={handleFriendModalOpen}>
              <PersonAddAlt1Icon sx={{color: 'black'}} />
            </IconButton>
          </Box>
          <Modal open={friend_modal} onClose={handleFriendModalClose}>
            <Box sx={style}>
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
                    onChange={handleFriendName}
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
          {lstState ? (
            <List>
              {friend_list.map((node, index) => {
                return <FriendList key={index} friend={node} />;
              })}
            </List>
          ) : (
            <List>
              {Array.from(block_users.values()).map((node, index) => {
                return <BlockUserList key={index} block_user={node} />;
              })}
            </List>
          )}
          {/* 밑줄 */}
          <Divider />
        </Box>
      </Drawer>
    </>
  );
}
export default SideBar;
