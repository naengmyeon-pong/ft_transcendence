import React, {useEffect, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {useLocation, useNavigate} from 'react-router-dom';
import apiManager from '@apiManager/apiManager';

function PasswordResetPage() {
  const navigate = useNavigate();
  const {state} = useLocation();

  useEffect(() => {
    if (state === null) {
      navigate('/');
    }
  }, []);
  const user_id = state?.user_id;
  const user_image =
    state && state.user_image
      ? state.user_image
      : `${process.env.PUBLIC_URL}/logo.jpeg`;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function isValidPasswordLength(password: string): boolean {
    // 8~20자 제한
    if (password.length > 7 && password.length < 21) {
      return true;
    }
    return false;
  }

  function isValidPasswordRule(password: string): boolean {
    // 대문자, 소문자, 특수문자 각각 하나 이상
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return regex.test(password);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //TODO: jwt토큰추가
    const data = {
      user_id: user_id,
      user_pw: password,
    };
    console.log(data);
    try {
      // const response = await apiManager.post('/user/changePw', data);
    } catch (error) {
      console.log('Password Change Error: ', error);
    }
  };

  function handlePassword(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }
  function handleConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value);
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h5">
        비밀번호 재설정
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar src={user_image} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              disabled
              fullWidth
              id="intraId"
              name="intraId"
              label="Intra ID"
              defaultValue={user_id}
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
            <Typography>비밀번호는 아래의 규칙에 맞게 입력해주세요.</Typography>
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
                  // secondary={
                  secondary={
                    <Typography variant="body2" color="text.secondary">
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
                    <Typography variant="body2" color="text.secondary">
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
            password !== confirmPassword ||
            isValidPasswordLength(password) === false ||
            isValidPasswordRule(password) === false
          }
          type="submit"
          fullWidth
          variant="contained"
          sx={{mt: 3, mb: 2}}
        >
          수정하기
        </Button>
      </Box>
    </React.Fragment>
  );
}

export default PasswordResetPage;
