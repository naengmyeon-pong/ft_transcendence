import React, {useEffect} from 'react';
import {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

function SignupPage() {
  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const data = new FormData(event.currentTarget);
  //   console.log({
  //     email: data.get('email'),
  //     password: data.get('password'),
  //   });
  // };
  const {state} = useLocation();
  const {user_id, user_image} = state;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  function isValidPasswordLength(password: string): boolean {
    // 8~20자 제한
    if (password.length > 7 && password.length < 21) {
      return true;
    }
    return false;
  }

  function isValidPasswordRule(password: string): boolean {
    // 대문자, 소문자, 특수문자 각각 하나 이상
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,}$/;
    return regex.test(password);
  }

  //성공했을경우만 버튼이 활성화가 됩니다
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('password'), data.get('passwordConfirm'));
    // TODO: 위치지정
    navigate('/');
    //실패했을 경우 지정해줘야함
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
        회원가입
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                avatar={
                  <Avatar
                    src={
                      user_image === null
                        ? `${process.env.PUBLIC_URL}/logo.jpeg`
                        : user_image
                    }
                  />
                }
                title="프로필 사진"
                subheader="기본 이미지는 인트라 이미지로 설정됩니다"
              />
              <Box display="flex" justifyContent="flex-end">
                <Button sx={{color: 'grey'}}>제거</Button>
                <Button>업로드</Button>
              </Box>
            </Card>
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
          <Grid item xs={9}>
            <TextField
              autoComplete="given-name"
              name="nickanme"
              required
              fullWidth
              id="nickanme"
              label="닉네임"
              helperText="2 ~ 8자 이내로 설정"
              autoFocus
            />
          </Grid>
          <Grid item xs={3} container justifyContent="flex-end">
            <Button variant="text">중복 확인</Button>
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
            <Checkbox />
          </Grid>
        </Grid>
        <Button
          disabled={
            password !== confirmPassword ||
            isValidPasswordLength(password) === false ||
            isValidPasswordRule(password) === false
          }
          fullWidth
          variant="contained"
          sx={{mt: 3, mb: 2}}
        >
          회원가입
        </Button>
      </Box>
    </React.Fragment>
  );
}

export default SignupPage;
