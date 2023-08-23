'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';

import axios from 'axios';
import {useRecoilState} from 'recoil';
import * as HTTP_STATUS from 'http-status';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import apiManager from '@/api/apiManager';
import {profileState} from '@/states/profile';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';

function TwoFactorAuth() {
  const router = useRouter();
  const [QRCodeImage, setQRCodeImage] = useState<string>('');
  const [profileDataState, setProfileDataState] = useRecoilState(profileState);

  const {openAlertSnackbar} = useAlertSnackbar();

  const handleClick = () => {
    router.back();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const otpPassword = event.currentTarget.otpPassword.value;

    try {
      const response = await apiManager.post('/2fa/turn-on', {
        code: otpPassword,
      });
      console.log(response);
      if (HTTP_STATUS.CREATED) {
        openAlertSnackbar({
          message: 'OTP 설정이 완료되었습니다.',
          severity: 'success',
        });
        setProfileDataState({...profileDataState, is_2fa_enabled: true});
        router.push('/user/setting');
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === HTTP_STATUS.UNAUTHORIZED) {
          openAlertSnackbar({message: '인증 번호가 일치하지 않습니다.'});
        }
      }
    }
  };

  useEffect(() => {
    const generateQRCode = async () => {
      const response = await apiManager.post(
        '/2fa/generate',
        {user_id: profileDataState.user_id},
        {
          responseType: 'arraybuffer',
        }
      );
      const base64Image: string = Buffer.from(response.data, 'binary').toString(
        'base64'
      );
      setQRCodeImage('data:image/png;base64,' + base64Image);
    };

    try {
      generateQRCode();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <Typography component="h1" variant="h5">
        2차 인증 설정
      </Typography>

      <Image src={QRCodeImage} alt="QRCode" width={256} height={256} />

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <TextField
          fullWidth
          id="otpPassword"
          name="otpPassword"
          label="OTP 6자리"
          InputLabelProps={{shrink: true}}
        />
        <Button fullWidth type="submit" variant="contained" sx={{mt: 3, mb: 2}}>
          인증하기
        </Button>
      </Box>

      <Button fullWidth variant="outlined" onClick={handleClick}>
        이전 화면으로 돌아가기
      </Button>
    </>
  );
}

export default TwoFactorAuth;
