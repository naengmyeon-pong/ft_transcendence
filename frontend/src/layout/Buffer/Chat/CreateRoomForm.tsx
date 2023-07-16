import React from 'react';
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

function CreateRoomForm() {
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
        />
        <TextField
          required
          margin="normal"
          fullWidth
          variant="outlined"
          label="비밀번호"
          type="password"
        />
        <TextField
          required
          margin="normal"
          fullWidth
          variant="outlined"
          label="인원수"
          type="password"
        />
        <TextField
          margin="normal"
          fullWidth
          select
          label="인원 수"
          defaultValue="4"
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
          <Button>확인</Button>
          {/* TODO: 자식 컴포넌트에서 닫을 방법 생각해볼것 */}
          <Button>닫기</Button>
        </Box>
      </FormControl>
    </Box>
  );
}
export default CreateRoomForm;
