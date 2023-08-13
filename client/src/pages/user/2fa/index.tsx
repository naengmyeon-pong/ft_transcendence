'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Image from 'next/image';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import DialogContentText from '@mui/material/DialogContentText';

import apiManager from '@/api/apiManager';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';
import {useProfileImage} from '@/hooks/useProfileImage';

const HTTP_STATUS = require('http-status');

function TwoFactorAuth() {
  const router = useRouter();
  const [QRCodeImage, setQRCodeImage] = useState<string>('');
  const {
    profileImageDataState: {userId},
  } = useProfileImage();
  const {openGlobalDialog, closeGlobalDialog} = useGlobalDialog();
  const {openAlertSnackbar} = useAlertSnackbar();

  useEffect(() => {
    const generateQRCode = async () => {
      const response = await apiManager.post('/2fa/generate', userId, {
        responseType: 'arraybuffer',
      });
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

      <Box sx={{mt: 1}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Image src={QRCodeImage} alt="QRCode" width={256} height={256} />
          </Grid>

          <Button fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
            회원가입
          </Button>
        </Grid>
      </Box>
    </>
  );
}

export default TwoFactorAuth;
