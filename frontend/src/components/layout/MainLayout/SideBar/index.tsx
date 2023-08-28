'use client';
import React, {useContext, useEffect, useRef} from 'react';
import {Box, Divider, Drawer, IconButton, Toolbar} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Profile from './Profile';
import {useState} from 'react';
import {UserContext} from '../Context';
import {UserType} from '@/types/UserContext';
import {drawerWidth} from '@/constants/sidebar';
import {useRecoilState, useRecoilValue} from 'recoil';
import {profileDMChoise} from '@/states/userContext';
import {dmUserInfo} from '@/states/dmUser';
import FindUser from './FriendList/FindUser';
import DisplayButtonGroup from './DisplayButtonGroup';
import DisplayList from './DisplayList';

function SideBar() {
  // lstState: 0 = 차단 목록, 1 = 친구 목록, 2 = DM
  const [lstState, setLstState] = useState(1);
  const {chat_socket, block_users} = useContext(UserContext);

  const [block_users_size, setBlockUsersSize] = useState<number>(0);

  const [friend_list, setFriendList] = useState<UserType[]>([]);
  const [friend_modal, setFriendModal] = useState<boolean>(false);
  const [profile_dm_choise, setDmChoise] = useRecoilState(profileDMChoise);

  const lstState_ref = useRef<number>(lstState);
  lstState_ref.current = lstState;

  //friendlist 갱신
  useEffect(() => {
    chat_socket?.on('update-friend-state', ({userId, state}) => {
      setFriendList(prev => {
        const copy_lst: UserType[] = [];
        if (prev === null || prev === undefined) {
          return prev;
        }
        prev.forEach(friend => {
          const copy_user: UserType = friend;
          if (copy_user.id === userId) {
            copy_user.state = state;
          }
          copy_lst.push(copy_user);
        });
        return copy_lst;
      });
    });
    return () => {
      chat_socket?.off('update-friend-state');
    };
  }, [chat_socket]);

  useEffect(() => {
    function handleFriendList(res: UserType[]) {
      setFriendList(res);
    }
    chat_socket?.on('update-friend-list', () => {
      chat_socket?.emit('friend-list');
    });
    chat_socket?.on('friend-list', handleFriendList);
    chat_socket?.emit('friend-list');

    return () => {
      chat_socket?.off('friend-list', handleFriendList);
      chat_socket?.off('update-friend-list');
    };
  }, [chat_socket]);

  useEffect(() => {
    setBlockUsersSize(block_users.size);
    function handleBlockList() {
      chat_socket?.emit('friend-list');
    }

    chat_socket?.on('block-list', handleBlockList);
    return () => {
      chat_socket?.off('block-list', handleBlockList);
    };
  }, [chat_socket, block_users.size]);

  useEffect(() => {
    if (profile_dm_choise === true) {
      setDmChoise(false);
      setLstState(2);
    }
  }, [profile_dm_choise, setDmChoise]);

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
          <Box sx={{p: '5px'}}>
            <Profile />
          </Box>
          <Divider />
          <Box display="flex" sx={{justifyContent: 'center', py: '1em'}}>
            <DisplayButtonGroup
              lstState={lstState}
              setLstState={setLstState}
              block_user_cnt={block_users_size}
              friend_cnt={friend_list.length}
            />
          </Box>
          <Box display="flex" sx={{justifyContent: 'center', p: '0.5em'}}>
            <IconButton onClick={() => setFriendModal(true)}>
              <PersonAddAlt1Icon sx={{color: 'black'}} />
            </IconButton>
          </Box>
          <FindUser
            friend_list={friend_list}
            friend_modal={friend_modal}
            setFriendModal={setFriendModal}
          />
          <Divider />
          <DisplayList lstState={lstState} friend_list={friend_list} />
        </Box>
      </Drawer>
    </>
  );
}
export default SideBar;
