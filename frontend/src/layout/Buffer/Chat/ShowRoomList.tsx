import React, {useEffect, useState} from 'react';
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
import {useNavigate} from 'react-router-dom';

interface ChatListData {
  passwordState: boolean;
  maxNum: string;
  currentNum: string;
  roomName: string;
  owner: string;
}

interface ComponentProps {
  chatList: ChatListData[];
}

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

async function checkRoomPassword(roomName: string) {
  console.log(roomName);
}

function ShowRoomList({chatList}: ComponentProps) {
  const navigate = useNavigate();
  const [passwordModal, setPasswordModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
    () => chatList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage]
  );

  function enterRoom(e: React.MouseEvent<unknown>, row: ChatListData) {
    e.preventDefault();
    if (row.passwordState) {
      setPasswordModal(true);
      return;
    }
    // TODO: 서버에 채팅방 이름과 패스워드를 보낸 후 맞는지 확인하고 들여보낸다
    navigate(`/menu/${row.roomName}`);
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
          {visibleRows.map(row => {
            // {chatList.map(row => {
            return (
              <TableRow key={row.roomName} onClick={e => enterRoom(e, row)}>
                <TableCell width="15%">
                  {/* <TableCell> */}
                  <Typography variant="h6">
                    {row.passwordState ? <LockIcon /> : ''}
                  </Typography>
                </TableCell>
                {/* <TableCell width="10%"> */}
                <TableCell>
                  <Typography variant="h6">
                    {`${row.currentNum}/${row.maxNum}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6"> {row.roomName}</Typography>
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
        count={chatList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Modal open={passwordModal} onClose={handlePasswordModalClose}>
        <Box sx={style}>
          <Typography variant="h4">비밀번호 입력</Typography>
          <TextField
            required
            margin="normal"
            fullWidth
            variant="outlined"
            helperText="비밀번호가 일치하지 않습니다"
          />
          <Box display="flex" justifyContent="flex-end" sx={{mt: '10px'}}>
            <Button>확인</Button>
            <Button onClick={handlePasswordModalClose}>닫기</Button>
          </Box>
        </Box>
      </Modal>
    </TableContainer>
  );
}

export default ShowRoomList;