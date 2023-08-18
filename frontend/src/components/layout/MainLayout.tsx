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
import {useRecoilState, useSetRecoilState} from 'recoil';
import {dmList} from '@/states/dmUser';

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
        const socketIo = io(`${process.env.NEXT_PUBLIC_BACKEND_SERVER}/chat`, {
          query: {
            user_id: response.data.user_id,
            nickname: response.data.user_nickname,
            user_image: `${response.data.user_image}`,
          },
        });
        setChatSocket(socketIo);
        const rep_block_list = await apiManager.get(
          `/chatroom/block_list/${response.data.user_id}`
        );
        console.log('rep_block_list: ', rep_block_list);

        init_setBlockUsers(rep_block_list.data);
        const rep = await apiManager.get('chatroom/dm_list', {
          params: {
            user_id: response.data.user_id,
          },
        });
        setDmList(rep.data);
        setInitMainLayout(true);
        console.log('dmList: ', rep);
      } catch (error) {
        router.push('/');
        console.log('MainLayout error: ', error);
      }
    })();
  }, []);

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
