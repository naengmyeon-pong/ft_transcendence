'use client';

import CustomAppBar from '@/components/MainLayout/CustomAppBar';
import {Box, Grid, Toolbar} from '@mui/material';
import SideBar from '@/components/MainLayout/SideBar';
import {io} from 'socket.io-client';
import {useContext, useEffect, useState} from 'react';
import {UserContext} from '../MainLayout/Context';
import {useRouter} from 'next/router';
import {UserType} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import Dm from '../Chat/Dm';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({children}: MainLayoutProps) {
  const {setUserId} = useContext(UserContext);
  const {setSocket} = useContext(UserContext);
  const {setUserNickName} = useContext(UserContext);
  const {user_image, setUserImage} = useContext(UserContext);
  const {block_users} = useContext(UserContext);
  const router = useRouter();

  const [initMainLayout, setInitMainLayout] = useState(false);

  function init_setBlockUsers(data: UserType[]) {
    for (const node of data) {
      block_users.set(node.id, node);
    }
    console.log('block_users: ', block_users);
  }
  useEffect(() => {
    (async () => {
      try {
        const response = await apiManager.get('/user/user-info');
        console.log('response: ', response);
        setUserId(response.data.user_id);
        setUserNickName(response.data.user_nickname);
        setUserImage(`${response.data.user_image}`);
        // const socketIo = io(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/pong`, {
        //   query: {
        //     user_id: response.data.user_id,
        //     nickname: response.data.user_nickname,
        //     user_image: `${response.data.user_image}`,
        //   },
        // });
        // setSocket(socketIo);

        const rep = await apiManager.get(
          `/chatroom/block_list/${response.data.user_id}`
        );
        console.log('block list: ', rep.data);
        init_setBlockUsers(rep.data);
        setInitMainLayout(true);
      } catch (error) {
        router.push('/');
        console.log('MainLayout error: ', error);
      }
      console.log('셋팅종료');
    })();
  }, []);
  console.log('init: ', initMainLayout);
  console.log('mainL: ', user_image);
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
              <Grid item xs={3} alignItems={'flex-start'}>
                <Dm />
              </Grid>
            </Grid>
            {/* </Box> */}
          </Box>
        </Box>
      )}
    </>
  );
}

export default MainLayout;
