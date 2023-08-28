import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {dmList, dmUserInfo} from '@/states/dmUser';
import {useCallback, useContext, useEffect, useRef} from 'react';
import {DmListData} from '@/types/UserContext';
import apiManager from '@/api/apiManager';
import {UserContext} from '../../Context';
import axios from 'axios';
import * as HTTP_STATUS from 'http-status';
import {tokenExpiredExit} from '@/states/tokenExpired';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';

export default function DMList() {
  const {chat_socket, user_id} = useContext(UserContext);
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);
  const {openAlertSnackbar} = useAlertSnackbar();
  const [dm_list, setDmList] = useRecoilState(dmList);

  const list_scroll = useRef<HTMLDivElement>(null);
  const setDmUser = useSetRecoilState(dmUserInfo);

  const changeUser = useCallback(
    async (row: DmListData) => {
      setDmUser({
        nickName: row.nickname,
        id: row.user2,
        image: '',
      });
    },
    [setDmUser]
  );

  const callDmList = useCallback(async () => {
    try {
      const rep = await apiManager.get('dm/dm_list', {
        params: {
          user_id: user_id,
        },
      });
      setDmList(rep.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          setTokenExpiredExit(true);
          return;
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  }, [setDmList, openAlertSnackbar, setTokenExpiredExit, user_id]);

  useEffect(() => {
    callDmList();
    chat_socket?.on('dm-message', () => callDmList());
    return () => {
      chat_socket?.off('dm-message');
    };
  }, [callDmList, chat_socket]);

  useEffect(() => {
    if (!list_scroll.current) return;

    const chatContainer = list_scroll.current;
    const {scrollHeight, clientHeight} = chatContainer;

    if (scrollHeight > clientHeight) {
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  }, [dm_list.length]);

  return (
    <>
      <Box
        overflow={'auto'}
        minWidth={'150px'}
        height={'400px'}
        border={'1px solid black'}
      >
        <Table>
          <TableBody>
            {dm_list?.map(row => {
              return (
                <TableRow key={row.user2} onClick={() => changeUser(row)}>
                  <TableCell>
                    <Typography>{`${row.nickname}`}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </>
  );
}
