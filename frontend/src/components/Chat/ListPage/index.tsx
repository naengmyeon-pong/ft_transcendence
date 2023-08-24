'use client';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';

import {Box, Button, Modal} from '@mui/material';
import ShowRoomList from './ShowRoomList';
import CreateRoomForm from './CreateRoomForm';
import {ChatListData} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import axios from 'axios';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import * as HTTP_STATUS from 'http-status';
import {useSetRecoilState} from 'recoil';
import {tokenExpiredExit} from '@/states/tokenExpired';

function ChatList() {
  const [roomList, setRoomList] = useState<ChatListData[]>([]);
  const [createModal, setCreateModal] = React.useState(false);
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);

  const handleCreateModalOpen = () => setCreateModal(true);
  const handleCreateModalClose = () => setCreateModal(false);

  const refreshChatList = useCallback(async () => {
    try {
      const rep = await apiManager.get('/chatroom/room_list');
      const data = rep.data;
      setRoomList(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
      setRoomList([]);
    }
  }, [setRoomList, openAlertSnackbar]);

  useEffect(() => {
    refreshChatList();
  }, [refreshChatList]);

  return (
    <>
      {/* <Demo /> */}
      <Box>
        <Box display="flex" justifyContent="center" marginRight="200px">
          {/* <Box> */}
          <h1>채팅목록</h1>
          {/* 클릭시 서버로부터 목록을 새로 받아옵니다 */}
          <Button onClick={refreshChatList}>
            <RefreshIcon />
          </Button>
        </Box>
        {/* 채팅방목록을 출력하는 컴포넌트입니다 */}
        <ShowRoomList roomList={roomList} refersh={refreshChatList} />

        <Box display="flex" justifyContent="center">
          {/* <Box> */}
          <Button
            size="large"
            variant="contained"
            sx={{width: '400px', mt: '30px', mr: '200px'}}
            onClick={handleCreateModalOpen}
          >
            방만들기
          </Button>
          <Modal open={createModal} onClose={handleCreateModalClose}>
            <Box>
              <CreateRoomForm
                createModal={createModal}
                setCreateModal={handleCreateModalClose}
              />
            </Box>
          </Modal>
        </Box>
      </Box>
    </>
  );
}

export default ChatList;
