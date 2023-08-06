import React, {useContext, useEffect, useState} from 'react';
import {Box, CssBaseline, Grid, Toolbar, Typography} from '@mui/material';
import FtAppBar from './Buffer/FtAppBar';
import FtSideBar from './Buffer/SideBar/FtSideBar';
import {Outlet, useParams} from 'react-router-dom';
import apiManager from '@apiManager/apiManager';
import {UserContext} from 'Context';
import {io} from 'socket.io-client';
import Dm from 'pages/ChatPage/DmPage';

function MainLayout() {
  const {setUserId} = useContext(UserContext);
  const {setSocket} = useContext(UserContext);
  const {setUserNickName} = useContext(UserContext);
  const {setUserImage} = useContext(UserContext);
  const {block_users} = useContext(UserContext);

  const [initMainLayout, setInitMainLayout] = useState(false);

  function init_setBlockUsers(data: string[]) {
    for (const node of data) {
      block_users.add(node);
    }
  }

  async function init() {
    try {
      const response = await apiManager.get('/user/user-info');
      console.log('response: ', response);
      setUserId(response.data.user_id);
      setUserNickName(response.data.user_nickname);
      setUserImage(`http://localhost:3001/${response.data.user_image}`);
      const socketIo = io(`http://localhost:3001/chat`, {
        query: {
          user_id: response.data.user_id,
          nickname: response.data.user_nickname,
          user_image: `http://localhost:3001/${response.data.user_image}`,
        },
      });
      setSocket(socketIo);

      const rep = await apiManager.get(
        `/chatroom/block_list/${response.data.user_id}`
      );
      console.log('block list: ', rep.data);
      init_setBlockUsers(rep.data);
      setInitMainLayout(true);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    init();
  }, []);
  return (
    <>
      {initMainLayout && (
        <Box height={'100vh'}>
          <CssBaseline />
          <FtAppBar />
          <Toolbar />
          <Box display="flex">
            <Box>
              <FtSideBar />
            </Box>
            {/* <Box width="80vw" paddingLeft="150px"> */}
            {/* <Box flexGrow="1"> */}
            <Grid container rowSpacing={20}>
              <Grid item xs={12}>
                {/* <Box> */}
                {/* 게임하기, 전체랭킹, 채팅목록 */}
                {/* <Grid item xs={8}> */}
                <Outlet />
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
