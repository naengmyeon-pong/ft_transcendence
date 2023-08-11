'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

import axios from 'axios';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import Checkbox from '@mui/material/Checkbox';
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
      const response = await apiManager.post('/2fa/generate', userId);
      setQRCodeImage(response.data);
      console.log(response);
    };

    try {
      const result = generateQRCode();
      console.log(result);
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
            {/*  */}
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
