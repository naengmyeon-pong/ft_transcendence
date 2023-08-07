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
import apiManager from '@apiManager/apiManager';
import {UserContext} from 'Context';

type CreateModalProps = {
  inviteModal: boolean;
  handleInviteClose: React.Dispatch<React.SetStateAction<boolean>>;
};

const style = {
  position: 'absolute',
  top: '40%',
  left: '48%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #FFF',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

function ChatInvite({inviteModal, handleInviteClose}: CreateModalProps) {
  const [nickName, setNickName] = useState('');
  const [list, setList] = useState<UserType[]>([]);
  const {socket, convert_page} = useContext(UserContext);

  function handleNickName(e: ChangeEvent<HTMLInputElement>) {
    setNickName(e.target.value);
  }
  async function handleInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nickName) {
      return;
    }
    try {
      const rep = await apiManager.get(`/chatroom/user/${nickName}`);
      setList(rep.data);
      console.log(rep.data);
    } catch (error) {
      console.log(error);
    }
    // TODO: 검색 후 해당하는 사용자를 표시해주는 컴포넌트를 생성
    console.log(`${nickName} 에게 초대메세지 전송`);
    setNickName('');
  }

  function handleClick(e: React.MouseEvent<unknown>, row: UserType) {
    e.preventDefault();
    socket?.emit(
      'chatroom-notification',
      {room_id: convert_page, target_id: row.id},
      (rep: boolean) => {
        console.log('chatroom-notification: ', rep);
      }
    );

    console.log(row);
  }

  function listInModal() {
    return (
      <>
        {list.map((row, index) => {
          return (
            <Box key={index} display={'flex'}>
              <Avatar
                src={`${process.env.REACT_APP_BACKEND_SERVER}/${row.image}`}
              />
              <Typography>{row.nickName}</Typography>
              <Button type="button" onClick={e => handleClick(e, row)}>
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
        <Box sx={style}>
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
              {/* TODO: 검색 조회 결과를 작성할 공간 */}
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
