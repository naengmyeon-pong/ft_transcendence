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
import axios from 'axios';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {tokenExpiredExit} from '@/states/tokenExpired';
import * as HTTP_STATUS from 'http-status';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({children}: MainLayoutProps) {
  const {setUserId} = useContext(UserContext);
  const {chat_socket, setChatSocket} = useContext(UserContext);
  const {setUserNickName} = useContext(UserContext);
  const {setUserImage} = useContext(UserContext);
  const {block_users} = useContext(UserContext);
  const setDmList = useSetRecoilState(dmList);
  const router = useRouter();
  const [, setProfileDataState] = useRecoilState(profileState);
  const {setManager} = useContext(UserContext);
  const [initMainLayout, setInitMainLayout] = useState(false);
  const {openAlertSnackbar} = useAlertSnackbar();
  const [token_expired_exit, setTokenExpiredExit] =
    useRecoilState(tokenExpiredExit);

  function init_setBlockUsers(data: UserType[]) {
    for (const node of data) {
      block_users.set(node.id, node);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await apiManager.get('/user/user-info');
        const {user_id, user_image, user_nickname, is_2fa_enabled} =
          response.data;
        const cacheBuster = new Date().getTime();
        setProfileDataState({
          user_id,
          image: `${user_image}?${cacheBuster}}`,
          nickname: user_nickname,
          is_2fa_enabled,
        });
        setUserId(user_id);
        setUserNickName(user_nickname);
        setUserImage(user_image);
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
        socketIo.on('token-expire', roomId => {
          // 서버가 연결을 끊은 경우 (ex, JWT 만료)
          sessionStorage.clear();
          router.push('/');
          // if (roomId) {
          socketIo.emit('leave-room', {room_id: roomId, state: true});
          // }
          socketIo.disconnect();
        });
      } catch (error) {
        router.push('/');
        if (axios.isAxiosError(error)) {
          if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
            setTokenExpiredExit(true);
            return;
          }
          openAlertSnackbar({message: error.response?.data.message});
        }
      }
    })();
  }, []);

  // 소켓 끊어졌을때
  useEffect(() => {
    if (token_expired_exit === true) {
      router.push('/');
      chat_socket?.disconnect();
      openAlertSnackbar({message: '토큰이 만료되었습니다'});
      setTokenExpiredExit(false);
    }
  }, [
    token_expired_exit,
    router,
    chat_socket,
    openAlertSnackbar,
    setTokenExpiredExit,
  ]);

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
          </Box>
        </Box>
      )}
    </>
  );
}

export default MainLayout;
