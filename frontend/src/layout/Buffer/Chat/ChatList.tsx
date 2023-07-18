import React, {useEffect, useState} from 'react';
import apiManager from '@apiManager/apiManager';
import RefreshIcon from '@mui/icons-material/Refresh';

import {Box, Button, Modal} from '@mui/material';
import ShowRoomList from './ShowRoomList';
import CreateRoomForm from './CreateRoomForm';

// 데이터 타입
interface ChatListData {
  passwordState: boolean;
  maxNum: string;
  currentNum: string;
  roomName: string;
  owner: string;
}

function ChatList() {
  // useEffect로 받아서 작성하고 새로고침은 버튼을 누른다
  const [chatList, setChatList] = useState<ChatListData[]>([]);
  const [createModal, setCreateModal] = React.useState(false);
  const handleCreateModalOpen = () => setCreateModal(true);
  const handleCreateModalClose = () => setCreateModal(false);

  async function refershChatList() {
    try {
      const rep = await apiManager.get('http://localhost:3003/rooms');
      const data = rep.data;
      setChatList(data);
    } catch (error) {
      console.log(error);
      setChatList([]);
    }
  }
  useEffect(() => {
    refershChatList();
  }, []);

  return (
    <>
      {/* <Demo /> */}
      <Box>
        <Box display="flex" justifyContent="center" marginRight="200px">
          {/* <Box> */}
          <h1>채팅목록</h1>
          {/* 클릭시 서버로부터 목록을 새로 받아옵니다 */}
          <Button onClick={refershChatList}>
            <RefreshIcon />
          </Button>
        </Box>
        {/* 채팅목록을 출력하는 컴포넌트입니다 */}
        <ShowRoomList chatList={chatList} />
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
              <CreateRoomForm />
            </Box>
          </Modal>
        </Box>
      </Box>
    </>
  );
}

export default ChatList;
