import React, {useContext, useEffect, useState} from 'react';
import {Box, CssBaseline, Grid, Toolbar} from '@mui/material';
import FtAppBar from './Buffer/FtAppBar';
import FtSideBar from './Buffer/SideBar/FtSideBar';
import {Outlet, useParams} from 'react-router-dom';
import apiManager from '@apiManager/apiManager';
import {UserContext} from 'Context';
import {io} from 'socket.io-client';

function MainLayout() {
  const {user_id, setUserId} = useContext(UserContext);
  const {socket, setSocket} = useContext(UserContext);
  const {setUserNickName} = useContext(UserContext);
  const {setUserImage} = useContext(UserContext);
  const {roomId} = useParams();
  const [initMainLayout, setInitMainLayout] = useState(false);
  const {setBlockUsers} = useContext(UserContext);

  function init_setBlockUsers(data: string[]) {
    const a = new Set<string>();
    for (const node of data) {
      a.add(node);
    }
    setBlockUsers(a);
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
            <Grid container justifyContent="center">
              <Grid item xs={8}>
                {/* <Box> */}
                {/* 게임하기, 전체랭킹, 채팅목록 */}
                <Outlet />
                {/* 개인 채팅창 위치 */}
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
