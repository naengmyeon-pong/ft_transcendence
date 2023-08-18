'use client';
import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import {UserContext} from '@/components/layout/MainLayout/Context';
import {ChatListData, RoomListProps} from '@/types/UserContext';
import apiManager from '@/api/apiManager';

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

function ShowRoomList({roomList, refersh}: RoomListProps) {
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const {setConvertPage} = useContext(UserContext);
  const room_id = useRef(0);
  const [password_error, setPasswordError] = useState(false);

  const handlePasswordModalOpen = () => setPasswordModal(true);
  const handlePasswordModalClose = () => setPasswordModal(false);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = React.useMemo(
    () => roomList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, roomList]
  );

  async function enterRoom(e: React.MouseEvent<unknown>, row: ChatListData) {
    e.preventDefault();
    if (row.is_password) {
      room_id.current = row.id;
      setPasswordModal(true);
      return;
    }
    if (row.current_nums >= row.max_nums) {
      alert('인원 초과입니다');
      return;
    }
    try {
      // TODO: 서버에 채팅방 이름과 패스워드를 보낸 후 맞는지 확인하고 들여보낸다
      const rep = await apiManager.get(`/chatroom/join_room?room_id=${row.id}`);
      console.log(row.id.toString());
      setConvertPage(row.id);
    } catch (error) {
      alert('존재하지 않는 채팅방입니다, ');
      refersh();
      console.log(error);
    }
  }

  async function checkPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const rep = await apiManager.post('/chatroom/chatroom_pw', {
        room_id: room_id.current,
        password: Number(password),
      });
      if (rep.data === false) {
        setPasswordError(true);
        return;
      }
      setConvertPage(room_id.current);
    } catch (error) {
      console.log(error);
    }
  }

  function handlePassword(e: ChangeEvent<HTMLInputElement>) {
    const check = /^[0-9]+$/;
    if (!check.test(e.target.value) && e.target.value !== '') {
      alert('숫자만 입력해주세요.');
      return;
    }
    setPassword(e.target.value);
  }
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h5">암호여부</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h5">인원</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h5">방 제목</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h5">방장</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row, index) => {
            // {roomList.map(row => {
            return (
              <TableRow key={index} onClick={e => enterRoom(e, row)}>
                <TableCell width="15%">
                  {/* <TableCell> */}
                  <Typography variant="h6">
                    {row.is_password ? <LockIcon /> : ''}
                  </Typography>
                </TableCell>
                {/* <TableCell width="10%"> */}
                <TableCell>
                  <Typography variant="h6">
                    {`${row.current_nums}/${row.max_nums}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6"> {row.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6"> {row.owner}</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={roomList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Modal open={passwordModal} onClose={handlePasswordModalClose}>
        <Box component="form" onSubmit={checkPassword} noValidate sx={style}>
          {/* <Box component="form" onSubmit={checkPassword} noValidate sx={style}> */}
          <Typography variant="h4">비밀번호 입력</Typography>
          <TextField
            error={password_error ? true : false}
            required
            margin="normal"
            fullWidth
            variant="outlined"
            helperText={password_error ? '비밀번호가 일치하지 않습니다' : ''}
            type="password"
            value={password}
            onChange={handlePassword}
          />
          <Box display="flex" justifyContent="flex-end" sx={{mt: '10px'}}>
            <Button type="submit">확인</Button>
            <Button onClick={handlePasswordModalClose}>닫기</Button>
          </Box>
        </Box>
      </Modal>
    </TableContainer>
  );
}

export default ShowRoomList;
