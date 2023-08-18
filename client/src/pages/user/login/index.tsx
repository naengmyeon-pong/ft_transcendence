'use client';

import {useRouter} from 'next/navigation';
import React, {useState} from 'react';

import {useRecoilState} from 'recoil';

import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';

import apiManager from '@/api/apiManager';
import logo from '@/public/logo.jpeg';
import withAuth from '@/components/hoc/withAuth';
import Svg42Logo from '@/components/Svg42Logo';
import {passwordResetState} from '@/states/passwordReset';

import * as HTTP_STATUS from 'http-status';

function LoginPage() {
  const router = useRouter();
  const [_, setPasswordResetDataState] = useRecoilState(passwordResetState);

  const [intraId, setIntraId] = useState<string>('');
  const [is2faLogin, setIs2faLogin] = useState<boolean>(false);

  // TODO: recoil persist 로 상태 관리하기
  const handleResetLinkClick = () => {
    setPasswordResetDataState(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredIntraId = event.currentTarget.intraId.value;
    const enteredPassword = event.currentTarget.password.value;
    const data = {
      user_id: enteredIntraId,
      user_pw: enteredPassword,
    };

    try {
      sessionStorage.removeItem('accessToken');
      const response = await apiManager.post('/user/signin', data);
      if (response.data === HTTP_STATUS.ACCEPTED) {
        setIntraId(enteredIntraId);
        setIs2faLogin(true);
      } else {
        sessionStorage.setItem('accessToken', response.data);
        router.push('/main/game');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      user_id: intraId,
      code: event.currentTarget.otpPassword.value,
    };

    try {
      const response = await apiManager.post('/2fa/authenticate', data);
      sessionStorage.setItem('accessToken', response.data);
      router.push('/main/game');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Avatar sx={{m: 1}} alt="logo" src={logo.src} />

      <Box sx={{textAlign: 'center'}}>
        <Typography component="h1" variant="h5">
          Welcome to
        </Typography>
        <Typography component="h1" variant="h5" sx={{fontWeight: 'bold'}}>
          Naengmyeon pong
        </Typography>
      </Box>

      {is2faLogin === false ? (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="intraId"
            name="intraId"
            label="Intra ID"
            autoComplete="text"
            autoFocus
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
          >
            로그인
          </Button>

          <Button
            component={Link}
            href={process.env.NEXT_PUBLIC_OAUTH_URL}
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              backgroundColor: '#424242',
              ':hover': {
                backgroundColor: 'black',
              },
            }}
          >
            <Svg42Logo />
            회원가입
          </Button>

          <Grid container>
            <Grid item xs>
              <Link
                variant="body2"
                href={process.env.NEXT_PUBLIC_OAUTH_URL}
                onClick={handleResetLinkClick}
              >
                비밀번호가 기억나지 않으신가요?
              </Link>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={handleOtpSubmit}
          noValidate
          sx={{mt: 1}}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="otpPassword"
            name="otpPassword"
            label="OTP Password"
            autoFocus
            defaultValue=""
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
          >
            OTP 인증하기
          </Button>
        </Box>
      )}
    </>
  );
}

export default withAuth(LoginPage);
