'use client';
import React, {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {UserContext} from '@/components/layout/MainLayout/Context';
import apiManager from '@/api/apiManager';
import axios from 'axios';
import * as HTTP_STATUS from 'http-status';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useSetRecoilState} from 'recoil';
import {tokenExpiredExit} from '@/states/tokenExpired';

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

const currencies = [
  {
    value: 4,
  },
  {
    value: 10,
  },
  {
    value: 20,
  },
  {
    value: 30,
  },
];

type CreateModalProps = {
  createModal: boolean;
  setCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function CreateRoomForm({setCreateModal}: CreateModalProps) {
  const [name, setName] = useState<string>('');
  const [isName, setIsName] = useState<boolean>(false);
  const [isHide, setIsHide] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [maxUser, setMaxUser] = useState<number>(4);
  const {user_id, setConvertPage} = useContext(UserContext);
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);

  const handleClose = useCallback(() => {
    setCreateModal(false);
  }, [setCreateModal]);

  const handleName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsName(false);
    setName(e.target.value);
  }, []);

  const handlePassword = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleMaxUser = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMaxUser(Number(e.target.value));
  }, []);

  async function handleCreateRoom(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    if (name.trim() === '') {
      setIsName(true);
      return;
    }
    try {
      const rep = await apiManager.post('/chatroom/create_room', {
        room_name: name,
        max_nums: maxUser,
        is_public: !isHide,
        is_password: password.trim() === '' ? false : true,
        password: password.trim() === '' ? null : password,
        user_id: user_id,
      });
      setConvertPage(rep?.data?.id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  }

  function handleHideRoom() {
    setIsHide(!isHide);
  }

  return (
    <Box sx={style}>
      <FormControl fullWidth>
        <Typography variant="h4">방 만들기</Typography>
        <TextField
          required
          type="text"
          margin="normal"
          fullWidth
          variant="outlined"
          label="방 제목"
          value={name}
          onChange={handleName}
          error={isName ? true : false}
          helperText={isName ? '방 제목을 입력해주세요' : ''}
        />
        <TextField
          required
          margin="normal"
          fullWidth
          variant="outlined"
          label="비밀번호"
          type="password"
          value={password}
          onChange={handlePassword}
        />

        <TextField
          margin="normal"
          fullWidth
          select
          label="인원 수"
          defaultValue="4"
          value={maxUser}
          onChange={handleMaxUser}
        >
          {currencies.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.value}
            </MenuItem>
          ))}
        </TextField>
        <Box display="flex" justifyContent="space-around">
          <Box flexDirection="column">
            <Typography variant="subtitle1">숨겨진 방 만들기</Typography>
            <Typography variant="body2">초대된 유저만 입장 가능</Typography>
          </Box>
          <Checkbox onClick={handleHideRoom} />
        </Box>
        <Box display="flex" justifyContent="flex-end" sx={{mt: '10px'}}>
          <Button type="submit" onClick={handleCreateRoom}>
            확인
          </Button>
          <Button onClick={handleClose}>닫기</Button>
        </Box>
      </FormControl>
    </Box>
  );
}
export default CreateRoomForm;
