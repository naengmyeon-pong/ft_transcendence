'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/router';
import type {InferGetServerSidePropsType, GetServerSideProps} from 'next';

import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
const HTTP_STATUS = require('http-status');

import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {AlertSnackbarType} from '@/types/alertSnackbar';
import apiManager from '@/api/apiManager';

export const getServerSideProps: GetServerSideProps = async ({query}) => {
  const {code} = query;
  return {props: {code: code || null}};
};

function AuthPage({
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const {openAlertSnackbar} = useAlertSnackbar();

  useEffect(() => {
    (async () => {
      const alertSnackbarData: AlertSnackbarType = {
        message: '',
        severity: 'error',
      };

      if (!code) {
        alertSnackbarData.message = '정상적인 접근이 아닙니다.';
        openAlertSnackbar(alertSnackbarData);
        router.push('/user/login');
        return;
      }

      try {
        const response = await apiManager.get(`/signup/auth?code=${code}`);

        if (response.status === HTTP_STATUS.OK) {
          const {is_already_signup, signup_jwt} = response.data;
          if (is_already_signup) {
            router.push('/user/login');
          } else {
            sessionStorage.setItem('accessToken', signup_jwt);
            router.push('/user/signup');
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const {message} = error.response.data;
            alertSnackbarData.message = message;
          }
        }
        openAlertSnackbar(alertSnackbarData);
        router.push('/user/login');
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
