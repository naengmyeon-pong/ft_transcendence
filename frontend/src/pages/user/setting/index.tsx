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
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import IconButton from '@mui/material/IconButton';
import LockIcon from '@mui/icons-material/Lock';
import DialogContentText from '@mui/material/DialogContentText';

import apiManager from '@/api/apiManager';
import {profileState} from '@/states/profile';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {useProfileImage} from '@/hooks/useProfileImage';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';
import ImageUpload from '@/components/signup/ImageUpload';
import {isValidNicknameLength} from '@/utils/user';
import Link from 'next/link';

const HTTP_STATUS = require('http-status');

function Setting() {
  const router = useRouter();
  const {profileImageDataState, setProfileImageDataState} = useProfileImage();
  const [profileDataState, setProfileDataState] = useRecoilState(profileState);
  const {openGlobalDialog, closeGlobalDialog} = useGlobalDialog();
  const {openAlertSnackbar} = useAlertSnackbar();
  const [isUniqueNickname, setIsUniqueNickname] = useState<boolean>(false);
  const [isInitialNickname, setIsInitialNickname] = useState<boolean>(true);
  const {is_2fa_enabled, nickname} = profileDataState;
  const {userId, uploadFile, isImageUploaded} = profileImageDataState;
  const initialNickname = profileDataState.nickname;

  const handleNicknameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const changedNickname = e.target.value;
    setProfileDataState({...profileDataState, nickname: changedNickname});
    setIsUniqueNickname(false);
    if (initialNickname === changedNickname) {
      setIsInitialNickname(true);
    } else {
      setIsInitialNickname(false);
    }
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

  const deleteUserApi = async () => {
    try {
      const response = await apiManager.delete('/user/delete');
      const {status} = response;
      console.log(response);
      if (status) {
        closeGlobalDialog();
        openAlertSnackbar({
          message: '정상적으로 탈퇴했습니다.',
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

  const handleDeleteUser = async () => {
    openGlobalDialog({
      title: '회원탈퇴',
      content: (
        <DialogContentText id="alert-dialog-description">
          회원탈퇴를 진행하시겠습니까?
        </DialogContentText>
      ),
      actions: (
        <>
          <Button onClick={closeGlobalDialog} sx={{color: 'grey'}}>
            아니오
          </Button>
          <Button onClick={deleteUserApi}>예</Button>
        </>
      ),
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append('user_id', userId);
    formData.append('user_nickname', nickname);
    if (uploadFile !== null) {
      formData.append('user_image', uploadFile);
    }

    console.log(formData);
    try {
      const response = await apiManager.patch('/user/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      if (HTTP_STATUS.CREATED) {
        openAlertSnackbar({
          message: '회원정보 수정이 완료되었습니다.',
          severity: 'success',
        });
        setProfileDataState({...profileDataState, image: ''});
        router.push('/main/game');
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        openAlertSnackbar({message: error.response?.data.message});
      }
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiManager.get('/user');
        const {user_id, is_2fa_enabled, user_nickname, user_image} =
          response.data;
        const cacheBuster = new Date().getTime();

        setProfileDataState({
          ...profileDataState,
          user_id,
          nickname: user_nickname,
          image: `${user_image}?${cacheBuster}}`,
          is_2fa_enabled,
        });
      } catch (error) {
        openAlertSnackbar({message: '에러가 발생했습니다. 다시 시도해주세요.'});
        console.log(error);
      }
    };

    fetchUser();
    setProfileImageDataState({
      ...profileImageDataState,
      isImageUploaded: false,
    });
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
              value={nickname}
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

          <Grid item container xs={10} sx={{mt: 2, mb: 2}}>
            <Grid item xs={1}>
              <LockIcon />
            </Grid>
            <Grid item xs={9}>
              <Typography>비밀번호 재설정</Typography>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <IconButton
              href="/user/reset-password"
              aria-label="password-change"
            >
              <ArrowRightIcon />
            </IconButton>
          </Grid>

          <Grid item xs={10}>
            <Typography variant="body1" component="div">
              2차 인증 활성화
              <Typography
                variant="body2"
                component="span"
                style={{color: is_2fa_enabled ? 'green' : 'grey'}}
              >
                {' '}
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
              <Link href="/user/2fa">
                <Button>설정</Button>
              </Link>
            )}
          </Grid>
        </Grid>

        <Button
          disabled={
            isImageUploaded === false &&
            (isInitialNickname || isUniqueNickname === false)
          }
          fullWidth
          type="submit"
          variant="contained"
          sx={{mt: 3, mb: 2}}
        >
          회원정보 수정
        </Button>

        <Button
          onClick={handleDeleteUser}
          fullWidth
          color="error"
          variant="outlined"
          sx={{mb: 2}}
        >
          회원탈퇴
        </Button>

        <Link href="/main/game">
          <Button fullWidth variant="outlined">
            메인 페이지로 돌아가기
          </Button>
        </Link>
      </Box>
    </>
  );
}

export default Setting;
