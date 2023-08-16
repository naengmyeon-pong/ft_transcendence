'use client';

import {useState} from 'react';
import {useRouter} from 'next/router';

import axios from 'axios';
import * as HTTP_STATUS from 'http-status';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

import apiManager from '@/api/apiManager';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import ImageUpload from '@/components/signup/ImageUpload';
import {
  isValidNicknameLength,
  isValidPasswordLength,
  isValidPasswordRule,
} from '@/utils/user';

function PasswordReset() {
  const router = useRouter();
  const {openAlertSnackbar} = useAlertSnackbar();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append('user_pw', password);

    console.log(formData);
    try {
      // TODO: token 유효기간이 지나면 다시 회원가입 버튼 누르도록 리다이렉션 하기
      const response = await apiManager.post('/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      if (HTTP_STATUS.OK) {
        openAlertSnackbar({
          message: '비밀번호 수정이 완료되었습니다.',
          severity: 'success',
        });
        router.back();
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.log('401');
        }
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Typography component="h1" variant="h5">
        회원정보 수정
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ImageUpload />
          </Grid>

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

          <Grid item xs={9}>
            <TextField
              error={
                nickname !== '' && isValidNicknameLength(nickname) === false
              }
              autoComplete="given-name"
              name="nickanme"
              required
              fullWidth
              id="nickanme"
              label="닉네임"
              helperText="2 ~ 8자 이내로 설정"
              onChange={handleNicknameInput}
              autoFocus
            />
          </Grid>
          <Grid item xs={3} container justifyContent="flex-end">
            <Button variant="text" onClick={handleDuplicatedNickname}>
              중복 확인
            </Button>
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

          <Grid item xs={10}>
            <Typography variant="body1" component="div">
              2차 인증 활성화
            </Typography>
            <Typography sx={{mb: 1.5}} color="text.secondary">
              Google Authenticator 로 추가 인증합니다.
            </Typography>
          </Grid>
          <Grid item xs={2} container>
            <Checkbox onChange={handle2FA} checked={is2faEnabled} />
          </Grid>
        </Grid>

        <Button
          disabled={isUniqueNickname === false}
          fullWidth
          type="submit"
          variant="contained"
          sx={{mt: 3, mb: 2}}
        >
          회원정보 수정
        </Button>
      </Box>
      <Button fullWidth variant="outlined" onClick={handleCancel}>
        이전 페이지로 돌아가기
      </Button>
    </>
  );
}

export default PasswordReset;
