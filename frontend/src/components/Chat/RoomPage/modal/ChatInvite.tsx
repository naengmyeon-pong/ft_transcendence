'use client';
import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, {ChangeEvent, FormEvent, useContext, useState} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {UserContext} from '@/components/layout/MainLayout/Context';
import {UserType} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import {modalStyle} from '@/components/styled/modalStyle';

type CreateModalProps = {
  inviteModal: boolean;
  handleInviteClose: React.Dispatch<React.SetStateAction<boolean>>;
};

function ChatInvite({inviteModal, handleInviteClose}: CreateModalProps) {
  const [nickName, setNickName] = useState('');
  const [list, setList] = useState<UserType[]>([]);
  const {user_id, chat_socket, convert_page} = useContext(UserContext);
  const [invite_list, setInviteList] = useState<Set<string>>(new Set());

  function handleNickName(e: ChangeEvent<HTMLInputElement>) {
    setNickName(e.target.value);
  }
  async function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nickName) {
      return;
    }
    try {
      const rep = await apiManager.get(`/chatroom/user/${nickName}/${user_id}`);
      setList(rep.data);
    } catch (error) {
      console.log(error);
    }
    // TODO: 검색 후 해당하는 사용자를 표시해주는 컴포넌트를 생성
    console.log(`${nickName} 에게 초대메세지 전송`);
    setNickName('');
  }

  function handleClick(e: React.MouseEvent<unknown>, row: UserType) {
    e.preventDefault();
    if (invite_list.has(row.id)) {
      return;
    }
    chat_socket?.emit(
      'chatroom-notification',
      {room_id: convert_page, target_id: row.id},
      (rep: boolean) => {
        console.log('chatroom-notification: ', rep);
      }
    );
    const new_invite_list = new Set(invite_list);
    new_invite_list.add(row.id);
    setInviteList(new_invite_list);
  }

  function listInModal() {
    return (
      <>
        {list.map((row, index) => {
          return (
            <Box key={index} display={'flex'}>
              <Avatar src={row.image} />
              <Typography>{row.nickName}</Typography>
              <Button
                disabled={invite_list.has(row.id) ? true : false}
                onClick={e => handleClick(e, row)}
              >
                초대하기
              </Button>
            </Box>
          );
        })}
      </>
    );
  }

  return (
    <>
      <Modal open={inviteModal} onClose={handleInviteClose}>
        <Box sx={modalStyle}>
          <FormControl fullWidth>
            <Typography variant="h4">초대하기</Typography>
            <Typography variant="body1">닉네임으로 검색 가능합니다</Typography>
            <Box component={'form'} onSubmit={handleInvite}>
              <TextField
                margin="normal"
                fullWidth
                variant="outlined"
                value={nickName}
                onChange={handleNickName}
                sx={{backgroundColor: 'white'}}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" sx={{display: 'none'}} />
              {/* 초대하기 리스트를 출력하는 함수 */}
              {listInModal()}
              <Button onClick={() => handleInviteClose(false)}>닫기</Button>
            </Box>
          </FormControl>
        </Box>
      </Modal>
    </>
  );
}
export default ChatInvite;
