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
import SearchIcon from '@mui/icons-material/Search';
import {modalStyle} from '@/components/styled/modalStyle';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useSetRecoilState} from 'recoil';
import {tokenExpiredExit} from '@/states/tokenExpired';
import {FormEvent, useContext, useState} from 'react';
import apiManager from '@/api/apiManager';
import {UserContext} from '../../Context';
import {UserType} from '@/types/UserContext';
import axios from 'axios';
import * as HTTP_STATUS from 'http-status';

interface FindUserProps {
  friend_list: UserType[];
  friend_modal: boolean;
  setFriendModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FindUser({
  friend_list,
  friend_modal,
  setFriendModal,
}: FindUserProps) {
  const {openAlertSnackbar} = useAlertSnackbar();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);
  const {user_id, chat_socket} = useContext(UserContext);
  const [friend_name, setFriendName] = useState<string>('');
  const [friend_search_list, setFriendSearchList] = useState<UserType[]>([]);

  function handleFriendModalClose() {
    setFriendName('');
    setFriendSearchList([]);
    setFriendModal(false);
  }

  async function handleFriendSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const rep = await apiManager.get('chatroom/search_user', {
        params: {
          user_id: user_id,
          user_nickname: friend_name,
        },
      });
      setFriendSearchList(rep.data);
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

  function listInModal() {
    const filter_search_list = friend_search_list.filter(
      searchUser => !friend_list.some(friend => friend.id === searchUser.id)
    );
    return (
      <>
        {filter_search_list.map((row, index) => {
          return (
            <Box key={index} display={'flex'}>
              <Avatar src={`${row.image}`} />
              <Typography>{row.nickName}</Typography>
              <Button
                // disabled={friend_list.find() ? true : false}
                onClick={() => chat_socket?.emit('add-friend', row.id)}
              >
                친구 추가
              </Button>
            </Box>
          );
        })}
      </>
    );
  }
  return (
    <>
      <Modal open={friend_modal} onClose={handleFriendModalClose}>
        <Box sx={modalStyle}>
          <FormControl fullWidth>
            <Typography variant="h4">친구 찾기</Typography>
            <Typography variant="body1">닉네임으로 검색 가능합니다</Typography>
            <Box component={'form'} onSubmit={handleFriendSearch}>
              <TextField
                margin="normal"
                fullWidth
                variant="outlined"
                value={friend_name}
                onChange={e => setFriendName(e.target.value)}
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
              <Button onClick={handleFriendModalClose}>닫기</Button>
            </Box>
          </FormControl>
        </Box>
      </Modal>
    </>
  );
}
