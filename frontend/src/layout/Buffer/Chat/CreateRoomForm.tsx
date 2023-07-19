import React, {ChangeEvent, useCallback, useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

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
    value: '4',
  },
  {
    value: '10',
  },
  {
    value: '20',
  },
  {
    value: '30',
  },
];

type CreateModalProps = {
  createModal: boolean;
  setCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function CreateRoomForm({setCreateModal}: CreateModalProps) {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [maxUser, setMaxUser] = useState('');

  const handleClose = useCallback(() => {
    setCreateModal(false);
  }, []);

  const handleTitle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handlePassword = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleMaxUser = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMaxUser(e.target.value);
  }, []);

  function handleCreateRoom(event: React.MouseEvent<HTMLElement>) {
    console.log(title);
    console.log(password);
    console.log(maxUser);
  }

  return (
    <Box sx={style}>
      <FormControl fullWidth>
        <Typography variant="h4">방 만들기</Typography>
        <TextField
          required
          margin="normal"
          fullWidth
          variant="outlined"
          label="방 제목"
          value={title}
          onChange={handleTitle}
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
          <Checkbox />
        </Box>
        <Box display="flex" justifyContent="flex-end" sx={{mt: '10px'}}>
          <Button type="submit" onClick={handleCreateRoom}>
            확인
          </Button>
          {/* TODO: 자식 컴포넌트에서 닫을 방법 생각해볼것 */}
          <Button onClick={handleClose}>닫기</Button>
        </Box>
      </FormControl>
    </Box>
  );
}
export default CreateRoomForm;
