'use client';
import {Box, Button, TextField, Typography, styled} from '@mui/material';
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import UserNode from './UserNode';
import ChatInvite from './modal/ChatInvite';
import {UserType} from '@/types/UserContext';
import {UserContext} from '@/components/layout/MainLayout/Context';
import apiManager from '@/api/apiManager';
import {useRouter} from 'next/router';
import {useGlobalModal} from '@/hooks/useGlobalModal';
import {useRecoilState} from 'recoil';
import {testInputState} from '@/states/globalModal';
import axios from 'axios';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import * as HTTP_STATUS from 'http-status';
import {useSetRecoilState} from 'recoil';
import {tokenExpiredExit} from '@/states/tokenExpired';

const BoxBorder = styled('div')({
  border: '1px solid black',
  borderRadius: '5px',
});

interface MemberInfo {
  id: string;
  image: string;
  nickName: string;
}

interface Member {
  owner: MemberInfo;
  admin: MemberInfo[];
  user: MemberInfo[];
}

interface MemberType {
  members: Member;
}

const ModalContent = () => {
  const [testInput, setTestInput] = useRecoilState(testInputState);

  const changeRoomPasswordTest = (e: ChangeEvent<HTMLInputElement>) => {
    setTestInput(e.target.value);
  };

  return (
    <TextField
      required
      margin="normal"
      fullWidth
      variant="outlined"
      label="비밀번호"
      type="password"
      value={testInput}
      onChange={changeRoomPasswordTest}
    />
  );
};

const ModalAction = () => {
  const roomId = useContext(UserContext).convert_page;

  const [testInput, setTestInput] = useRecoilState(testInputState);
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);

  const {closeGlobalModal} = useGlobalModal();

  const sendChangePassword = useCallback(async () => {
    try {
      await apiManager.post('/chatroom/update_chatroom_pw', {
        room_id: roomId,
        password: testInput.trim() === '' ? null : testInput,
      });
      setTestInput('');
      closeGlobalModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  }, [
    closeGlobalModal,
    roomId,
    setTestInput,
    testInput,
    openAlertSnackbar,
    setTokenExpiredExit,
  ]);

  return (
    <Box>
      <Button onClick={sendChangePassword}>변경</Button>
      <Button onClick={closeGlobalModal}>취소</Button>
    </Box>
  );
};

export default function UserList() {
  const [owner, setOwner] = useState<UserType>();
  const [adminUser, setAdminUser] = useState<UserType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [inviteModal, setInviteModal] = useState<boolean>(false);

  const {chat_socket} = useContext(UserContext);
  const {user_id} = useContext(UserContext);
  const {setConvertPage} = useContext(UserContext);

  const roomId = useContext(UserContext).convert_page;

  const router = useRouter();

  const {openGlobalModal} = useGlobalModal();

  async function roomUsers() {
    try {
      const rep = await apiManager.get(
        `/chatroom/room_members/?room_id=${roomId}`
      );
      setOwner(rep.data?.owner);
      setAdminUser(rep.data?.admin);
      setUsers(rep.data?.user);
    } catch (error) {
      alert('존재하지 않는 채팅방입니다');
      router.push('/menu/chat/list');
      console.log(error);
      // TODO: 벤유저가 들어왔을 경우
    }
  }

  function getPermission() {
    if (owner?.id === user_id) {
      return 'owner';
    }

    for (const node of adminUser) {
      if (user_id === node?.id) {
        return 'admin';
      }
    }
    for (const node of users) {
      if (user_id === node?.id) {
        return 'user';
      }
    }
    return 'not user';
  }

  const myPermission: string = getPermission();

  function handleInvite() {
    setInviteModal(true);
  }

  function handleInviteClose() {
    setInviteModal(false);
  }

  function exit() {
    chat_socket?.emit('leave-room', {room_id: roomId}, () => {
      setConvertPage(0);
    });
  }

  function handleUserList(test: MemberType) {
    setAdminUser(test?.members?.admin);
    setUsers(test?.members?.user);
  }

  const changeRoomInfo = useCallback(() => {
    openGlobalModal({
      title: '방 정보 변경',
      content: <ModalContent />,
      action: <ModalAction />,
    });
  }, [openGlobalModal]);

  useEffect(() => {
    // 소켓 이벤트 등록해서 들어온 메세지 헨들링
    console.log('room-member on');
    chat_socket?.on('room-member', handleUserList);
    roomUsers();
  }, []);

  return (
    <>
      <BoxBorder style={{backgroundColor: '#e0e0e0'}}>
        <Typography variant="body1">방장: {owner?.nickName}</Typography>
      </BoxBorder>
      <BoxBorder style={{height: '200px'}}>
        <Typography variant="body1" ml={'10px'}>
          채팅방 관리자
        </Typography>
        {/* 나를 제외한 관리자 유저 등급 출력 */}
        <ul style={{marginTop: '5px', width: 'auto', overflow: 'auto'}}>
          {adminUser?.map((node, index) => {
            return (
              <UserNode
                key={index}
                user={node}
                permission={'admin'}
                myPermission={myPermission}
              />
            );
          })}
        </ul>
      </BoxBorder>
      <BoxBorder style={{height: '200px'}}>
        <Typography variant="body1" ml={'10px'}>
          채팅 참여자
        </Typography>
        {/* 나를 제외한 일반 유저 등급 */}
        <ul style={{overflow: 'auto'}}>
          {users?.map((node, index) => {
            return (
              <UserNode
                key={index}
                user={node}
                permission={'user'}
                myPermission={myPermission}
              />
            );
          })}
        </ul>
      </BoxBorder>
      <Box display="flex" justifyContent="flex-end">
        {myPermission === 'owner' && (
          <Button onClick={changeRoomInfo}> 방 정보 변경 </Button>
        )}
        <Button onClick={handleInvite}>초대하기</Button>
        <Button onClick={exit}>나가기</Button>
      </Box>
      {inviteModal && (
        <ChatInvite
          inviteModal={inviteModal}
          handleInviteClose={handleInviteClose}
        />
      )}
    </>
  );
}
