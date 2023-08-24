'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/router';

import axios from 'axios';
import {useRecoilValue} from 'recoil';
import * as HTTP_STATUS from 'http-status';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import apiManager from '@/api/apiManager';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useProfileImage} from '@/hooks/useProfileImage';
import {passwordResetState} from '@/states/passwordReset';
import {isValidPasswordLength, isValidPasswordRule} from '@/utils/user';
import {
  isTokenExpired,
  getExpirationTimeInMilliseconds,
  getRemainedTime,
  getJwtToken,
} from '@/utils/token';
import {isValidSignupToken, isValidUserToken} from '@/api/auth';

function PasswordReset() {
  const router = useRouter();
  const {openAlertSnackbar} = useAlertSnackbar();
  const {
    profileImageDataState: {userId},
  } = useProfileImage();
  const passwordReset = useRecoilValue(passwordResetState);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [remainedTime, setRemainedTime] = useState<string>('');

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      let endpoint = '';
      if (passwordReset === true) {
        endpoint = '/signup/changePw';
      } else {
        endpoint = '/user/changePw';
      }
      const response = await apiManager.post(endpoint, {user_pw: password});
      if (response.status === HTTP_STATUS.CREATED) {
        openAlertSnackbar({
          message: '비밀번호 수정이 완료되었습니다.',
          severity: 'success',
        });
        if (passwordReset === true) {
          router.push('/user/login');
        } else {
          router.push('/user/setting');
        }
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  };

  const handleCancel = () => {
    if (passwordReset) {
      router.push('/user/login');
    } else {
      router.back();
    }
  };

  useEffect(() => {
    (async () => {
      if (getJwtToken() === null) {
        openAlertSnackbar({message: '잘못된 접근입니다.'});
        router.push('/user/login');
        return;
      }

      if (
        (await isValidSignupToken()) === false &&
        (await isValidUserToken()) === false
      ) {
        openAlertSnackbar({message: '잘못된 접근입니다.'});
        router.push('/user/login');
        return;
      }
    })();

    const expirationTime = getExpirationTimeInMilliseconds();
    const intervalId = setInterval(() => {
      if (isTokenExpired(expirationTime)) {
        clearInterval(intervalId);
        openAlertSnackbar({
          message: '비밀번호 재설정 시간이 만료되었습니다.',
        });
        if (passwordReset === true) {
          router.push('/user/login');
        } else {
          router.push('/user/setting');
        }
        return;
      }
      const formattedTime: string = getRemainedTime(expirationTime);
      setRemainedTime(formattedTime);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <Typography component="h1" variant="h5">
        비밀번호 재설정
      </Typography>

      <Typography sx={{mt: 2, mb: 2, color: 'grey'}}>
        비밀번호 재설정 만료 시간 {remainedTime}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              disabled
              fullWidth
              id="intraId"
              name="intraId"
              label="Intra ID"
              InputLabelProps={{shrink: true}}
              value={userId}
              variant="filled"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              error={
                password !== '' &&
                (!isValidPasswordLength(password) ||
                  !isValidPasswordRule(password))
              }
              required
              fullWidth
              id="password"
              name="password"
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              onChange={handlePassword}
              helperText={
                isValidPasswordLength(password) === false && password !== ''
                  ? '비밀번호는 8 ~ 20 사이입니다.'
                  : isValidPasswordRule(password) === false && password !== ''
                  ? '비밀번호는 영문 대/소문자, 숫자, 특수문자 조합이여야 합니다.'
                  : ''
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              error={confirmPassword !== '' && password !== confirmPassword}
              required
              fullWidth
              id="passwordConfirm"
              name="passwordConfirm"
              label="비밀번호 재확인"
              type="password"
              autoComplete="current-password"
              onChange={handleConfirmPassword}
              helperText={
                confirmPassword !== '' && password !== confirmPassword
                  ? '비밀번호가 일치하지 않습니다.'
                  : ''
              }
            />
          </Grid>

          <Grid item xs={12}>
            <List
              sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
            >
              <ListItem color="success">
                <ListItemIcon>
                  <CheckIcon
                    color={
                      isValidPasswordLength(password) ? 'success' : 'disabled'
                    }
                  ></CheckIcon>
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  secondary={
                    <Typography
                      variant="body2"
                      color={
                        isValidPasswordLength(password)
                          ? 'success.main'
                          : 'text.secondary'
                      }
                    >
                      8 ~ 20자 사이
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon
                    color={
                      isValidPasswordRule(password) ? 'success' : 'disabled'
                    }
                  ></CheckIcon>
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  secondary={
                    <Typography
                      variant="body2"
                      color={
                        isValidPasswordRule(password)
                          ? 'success.main'
                          : 'text.secondary'
                      }
                    >
                      영문 대/소문자, 숫자, 특수문자 조합
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Button
          disabled={
            isValidPasswordLength(password) === false ||
            isValidPasswordRule(password) === false ||
            password !== confirmPassword ||
            confirmPassword === '' ||
            password === ''
          }
          fullWidth
          type="submit"
          variant="contained"
          sx={{mt: 3, mb: 2}}
        >
          비밀번호 재설정
        </Button>
      </Box>
      <Button fullWidth variant="outlined" onClick={handleCancel}>
        이전 페이지로 돌아가기
      </Button>
    </>
  );
}

export default PasswordReset;
