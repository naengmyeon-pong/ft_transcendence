import {useCallback, useContext} from 'react';
import {UserContext} from '../Context';
import {useRouter} from 'next/router';
import {Button} from '@mui/material';
import {useSetRecoilState} from 'recoil';
import {loginState} from '@/states/loginState';

export default function LogOut() {
  const {chat_socket} = useContext(UserContext);
  const setLoginState = useSetRecoilState(loginState);
  const router = useRouter();

  const logOut = useCallback(() => {
    sessionStorage.removeItem('accessToken');
    chat_socket?.disconnect();
    setLoginState({is2faEnabled: false, isOAuthLogin: false, user_id: ''});
    router.push('/');
  }, [chat_socket, router]);

  return <Button onClick={logOut}>로그아웃</Button>;
}
