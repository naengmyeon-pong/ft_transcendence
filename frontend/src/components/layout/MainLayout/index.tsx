'use client';

import {useRouter} from 'next/router';
import {useContext, useEffect, useState} from 'react';

import {Manager, io} from 'socket.io-client';
import {useRecoilState, useSetRecoilState} from 'recoil';

import {Box, Grid, Toolbar} from '@mui/material';

import apiManager from '@/api/apiManager';
import CustomAppBar from '@/components/layout/MainLayout/AppBar';
import SideBar from '@/components/layout/MainLayout/SideBar';
import {UserContext} from '@/components/layout/MainLayout/Context';
import {UserType} from '@/types/UserContext';
import {dmList} from '@/states/dmUser';
import {profileState} from '@/states/profile';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({children}: MainLayoutProps) {
  const {setUserId} = useContext(UserContext);
  const {setChatSocket} = useContext(UserContext);
  const {setUserNickName} = useContext(UserContext);
  const {user_image, setUserImage} = useContext(UserContext);
  const {block_users} = useContext(UserContext);
  const setDmList = useSetRecoilState(dmList);
  const router = useRouter();
  const [profileDataState, setProfileDataState] = useRecoilState(profileState);
  const {manager, setManager} = useContext(UserContext);
  const [initMainLayout, setInitMainLayout] = useState(false);

  // const roomId = useContext(UserContext).convert_page;
  // const {chat_socket} = useContext(UserContext);

  function init_setBlockUsers(data: UserType[]) {
    for (const node of data) {
      block_users.set(node.id, node);
    }
    // console.log('block_users: ', block_users);
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await apiManager.get('/user/user-info');
        // console.log('response: ', response);
        const {user_id, user_image, user_nickname, is_2fa_enabled} =
          response.data;
        setProfileDataState({
          user_id,
          image: user_image,
          nickname: user_nickname,
          is_2fa_enabled,
        });
        setUserId(response.data.user_id);
        setUserNickName(response.data.user_nickname);
        setUserImage(`${response.data.user_image}`);
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken === null) {
          router.push('/');
        }
        const manager = new Manager(
          `${process.env.NEXT_PUBLIC_BACKEND_SERVER}`,
          {
            reconnectionDelayMax: 3000,
            query: {
              user_id: response.data.user_id,
              nickname: response.data.user_nickname,
              user_image: response.data.user_image,
            },
          }
        );

        const socketIo = manager.socket('/pong', {
          auth: {
            token: accessToken,
          },
        });
        setChatSocket(socketIo);
        setManager(manager);
        const rep_block_list = await apiManager.get(
          `/chatroom/block_list/${response.data.user_id}`
        );
        console.log('rep_block_list: ', rep_block_list);

        init_setBlockUsers(rep_block_list.data);
        const rep = await apiManager.get('dm/dm_list', {
          params: {
            user_id: response.data.user_id,
          },
        });
        setDmList(rep.data);
        setInitMainLayout(true);
        // console.log('dmList: ', rep);
        socketIo.on('token-expire', roomId => {
          // console.log('roomId: ', roomId);
          // 서버가 연결을 끊은 경우 (ex, JWT 만료)
          sessionStorage.clear();
          router.push('/');
          if (roomId) {
            socketIo.emit('leave-room', {room_id: roomId, state: true});
          }
          socketIo.disconnect();
        });
      } catch (error) {
        router.push('/');
        console.log('MainLayout error: ', error);
      }
    })();
  }, []);

  // useEffect(() => {
  //   chat_socket?.on('token-expire', reason => {
  //     console.log('reason: ', reason);
  //     // 서버가 연결을 끊은 경우 (ex, JWT 만료)
  //     sessionStorage.clear();
  //     router.push('/');
  //     chat_socket?.emit('leave-room', {room_id: roomId, state: true});
  //     chat_socket.disconnect();
  //   });
  //   return () => {
  //     chat_socket?.off('token-expire');
  //   };
  // }, [chat_socket, roomId, router]);

  return (
    <>
      {initMainLayout && (
        <Box height={'100vh'}>
          <CustomAppBar />
          <Toolbar />
          <Box display="flex">
            <Box>
              <SideBar />
            </Box>
            {/* <Box width="80vw" paddingLeft="150px"> */}
            {/* <Box flexGrow="1"> */}
            <Grid container rowSpacing={20}>
              <Grid item xs={12}>
                {/* <Box> */}
                {/* 게임하기, 전체랭킹, 채팅목록 */}
                {/* <Grid item xs={8}> */}
                {children}
                {/* </Grid> */}
              </Grid>
              {/* 개인 채팅창 위치 */}
            </Grid>
            {/* </Box> */}
          </Box>
        </Box>
      )}
    </>
  );
}

export default MainLayout;
