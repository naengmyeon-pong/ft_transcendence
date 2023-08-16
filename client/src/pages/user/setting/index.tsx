'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

import axios from 'axios';
import {useRecoilState} from 'recoil';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DialogContentText from '@mui/material/DialogContentText';

import apiManager from '@/api/apiManager';
import {profileState} from '@/states/profile';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useProfileImage} from '@/hooks/useProfileImage';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';
import ImageUpload from '@/components/signup/ImageUpload';
import {
  isValidNicknameLength,
  isValidPasswordLength,
  isValidPasswordRule,
} from '@/utils/user';

const HTTP_STATUS = require('http-status');

function Setting() {
  const router = useRouter();
  const {
    profileImageDataState: {userId, uploadFile},
  } = useProfileImage();
  const [profileDataState, setProfileDataState] = useRecoilState(profileState);

  const {openGlobalDialog, closeGlobalDialog} = useGlobalDialog();
  const {openAlertSnackbar} = useAlertSnackbar();
  const [nickname, setNickname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isUniqueNickname, setIsUniqueNickname] = useState<boolean>(false);

  const {is_2fa_enabled} = profileDataState;

  const handleNicknameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleDuplicatedNickname = async () => {
    if (isValidNicknameLength(nickname) === false) {
      openAlertSnackbar({
        message: `닉네임의 길이를 확인해주세요. (현재 길이: ${nickname.length}자)`,
      });
      return;
    }

    const response = await apiManager.get(
      `/signup/nickname?user_id=${userId}&nickname=${nickname}`
    );
    try {
      const result = response.data;
      if (result === true) {
        setIsUniqueNickname(true);
      } else {
        setIsUniqueNickname(false);
      }
      console.log(response.data);
      openGlobalDialog({
        title: '중복 확인',
        content: (
          <DialogContentText id="alert-dialog-description">
            {nickname} 은(는) 사용
            <Typography
              component="span"
              style={{color: result ? 'inherit' : 'red'}}
            >
              {result ? ' 가능' : ' 불가능'}
            </Typography>
            합니다.
          </DialogContentText>
        ),
        actions: (
          <Button onClick={closeGlobalDialog} autoFocus>
            닫기
          </Button>
        ),
      });
      console.log(response);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  };

  const handle2FAoff = async () => {
    try {
      const response = await apiManager.post('/2fa/turn-off');
      console.log(response);
      if (HTTP_STATUS.CREATED) {
        openAlertSnackbar({
          message: 'OTP 설정이 해제되었습니다.',
          severity: 'success',
        });
        setProfileDataState({...profileDataState, is_2fa_enabled: false});
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append('user_nickname', nickname);
    if (uploadFile !== null) {
      formData.append('user_image', uploadFile);
    }

    console.log(formData);
    try {
      const response = await apiManager.post('/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      if (HTTP_STATUS.CREATED) {
        router.push('/user/2fa');
        openAlertSnackbar({
          message: '회원가입이 정상적으로 완료되었습니다.',
          severity: 'success',
        });
        router.push('/user/login');
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  };

  const handleCancel = () => {
    router.push('/main/game');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiManager.get('/user');
        setProfileDataState(response.data);
      } catch (error) {
        openAlertSnackbar({message: '에러가 발생했습니다. 다시 시도해주세요.'});
        console.log(error);
      }
    };

    fetchUser();
  }, []);

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
              <Typography
                variant="span"
                style={{color: is_2fa_enabled ? 'green' : 'grey'}}
              >
                ({is_2fa_enabled ? 'ON' : 'OFF'})
              </Typography>
            </Typography>
            <Typography sx={{mb: 1.5}} color="text.secondary">
              Google Authenticator 로 추가 인증합니다.
            </Typography>
          </Grid>
          <Grid item xs={2} container>
            {is_2fa_enabled ? (
              <Button onClick={handle2FAoff}>제거</Button>
            ) : (
              <Button href="/user/2fa">설정</Button>
            )}
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

export default Setting;