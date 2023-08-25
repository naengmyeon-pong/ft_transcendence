'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/router';
import type {InferGetServerSidePropsType, GetServerSideProps} from 'next';

import axios from 'axios';
import {useRecoilState, useRecoilValue} from 'recoil';
import * as HTTP_STATUS from 'http-status';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import apiManager from '@/api/apiManager';
import {useProfileImage} from '@/hooks/useProfileImage';
import {passwordResetState} from '@/states/passwordReset';
import {loginState} from '@/states/loginState';
import {OAuthUser} from '@/common/types/oauth';

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const {code} = query;
  return {props: {code: code || null}};
};

function AuthPage({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const {openAlertSnackbar} = useAlertSnackbar();
  const {setUserId} = useProfileImage();
  const passwordReset = useRecoilValue(passwordResetState);
  const [{isOAuthLogin}, setLoginState] = useRecoilState(loginState);

  useEffect(() => {
    (async () => {
      if (!code) {
        openAlertSnackbar({message: '잘못된 접근입니다.'});
        router.push('/user/login');
        return;
      }

      if (isOAuthLogin) {
        try {
          const response = await apiManager.get(`/user/oauth?code=${code}`);
          const {status, user_id}: OAuthUser = response.data;
          if (status === HTTP_STATUS.ACCEPTED) {
            setLoginState({user_id, isOAuthLogin, is2faEnabled: true});
            router.push('/user/login');
          } else {
            const accessToken = response.data;
            sessionStorage.setItem('accessToken', accessToken);
            router.push('/main/game');
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const message = error.response?.data.message;
            openAlertSnackbar({message});
            router.push('/user/login');
          }
        }
        return;
      }

      try {
        const response = await apiManager.get(`/signup/auth?code=${code}`);

        if (response.status === HTTP_STATUS.OK) {
          const {is_already_signup, signup_jwt, user_id} = response.data;
          setUserId(user_id);
          if (is_already_signup) {
            if (passwordReset === true) {
              sessionStorage.setItem('accessToken', signup_jwt);
              router.push('/user/reset-password');
            } else {
              openAlertSnackbar({
                severity: 'info',
                message: '이미 회원가입이 되어있습니다.',
              });
              router.push('/user/login');
            }
          } else {
            if (passwordReset === true) {
              openAlertSnackbar({
                message: '회원가입이 되어있지 않습니다.',
              });
              router.push('/user/login');
            } else {
              sessionStorage.setItem('accessToken', signup_jwt);
              router.push('/user/signup');
            }
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const {message} = error.response.data;
            openAlertSnackbar({
              message,
            });
          } else if (error.code === 'ERR_NETWORK') {
            openAlertSnackbar({
              message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            });
          }
          router.push('/user/login');
        }
      }
    })();
  }, []);

  return (
    <>
      <CircularProgress sx={{mb: 3}} />
      <Typography>회원 정보를 확인하는 중입니다.</Typography>
    </>
  );
}

export default AuthPage;
