import React, {useContext, useEffect} from 'react';
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

  async function init() {
    const response = await apiManager.get('/user/user-info');
    console.log('response: ', response);
    setUserId(response.data.user_id);
    setUserNickName(response.data.user_nickname);
    setUserImage(`http://localhost:3001/${response.data.user_image}`);
    const socketIo = io(`http://localhost:3001/chat`, {
      query: {
        user_id: response.data.user_id,
        nickname: response.data.user_nickname,
        room_id: roomId === undefined ? undefined : roomId,
      },
    });
    setSocket(socketIo);
  }
  useEffect(() => {
    init();
  }, []);
  return (
    <>
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
    </>
  );
}

export default MainLayout;
