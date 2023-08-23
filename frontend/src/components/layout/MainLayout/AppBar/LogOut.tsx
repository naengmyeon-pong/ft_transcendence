import {useCallback, useContext} from 'react';
import {UserContext} from '../Context';
import {useRouter} from 'next/router';
import {Button} from '@mui/material';

export default function LogOut() {
  const {chat_socket} = useContext(UserContext);
  const router = useRouter();

  const logOut = useCallback(() => {
    sessionStorage.removeItem('accessToken');
    chat_socket?.disconnect();
    router.push('/');
  }, [chat_socket, router]);

  return <Button onClick={logOut}>로그아웃</Button>;
}
