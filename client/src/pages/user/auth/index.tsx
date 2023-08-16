'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/router';
import type {InferGetServerSidePropsType, GetServerSideProps} from 'next';

import axios from 'axios';
import {useRecoilState} from 'recoil';
import * as HTTP_STATUS from 'http-status';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import apiManager from '@/api/apiManager';
import {useProfileImage} from '@/hooks/useProfileImage';
import {passwordResetState} from '@/states/passwordReset';

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
  const [passwordResetDataState, _] = useRecoilState(passwordResetState);

  useEffect(() => {
    (async () => {
      if (!code) {
        openAlertSnackbar({message: '잘못된 접근입니다.'});
        router.push('/user/login');
        return;
      }

      console.log(passwordResetDataState);
      try {
        const response = await apiManager.get(`/signup/auth?code=${code}`);

        if (response.status === HTTP_STATUS.OK) {
          const {is_already_signup, signup_jwt, user_id} = response.data;
          if (is_already_signup) {
            if (passwordResetDataState === false) {
              openAlertSnackbar({
                severity: 'info',
                message: '이미 회원가입이 되어있습니다.',
              });
              router.push('/user/login');
            } else {
              router.push('/user/reset-password');
            }
          } else {
            sessionStorage.setItem('accessToken', signup_jwt);
            setUserId(user_id);
            router.push('/user/signup');
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const {message} = error.response.data;
            openAlertSnackbar({
              message,
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
