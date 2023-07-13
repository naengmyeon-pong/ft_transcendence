import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Svg42Logo from './Logo';

function LoginPage() {
  // TODO: 백엔드 통신 API 맞춰서 수정
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <React.Fragment>
      <Avatar
        sx={{m: 1}}
        alt="logo"
        src={`${process.env.PUBLIC_URL}/logo.jpeg`}
      />

      <Box sx={{textAlign: 'center'}}>
        <Typography component="h1" variant="h5">
          Welcome to
        </Typography>
        <Typography component="h1" variant="h5" sx={{fontWeight: 'bold'}}>
          Naengmyeon pong
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Intra ID"
          name="username"
          autoComplete="text"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="비밀번호 기억하기"
        />
        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
          로그인
        </Button>
        <Button
          component={Link}
          href={process.env.REACT_APP_OAUTH_URL}
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
          {/* TODO: 로고를 텍스트에서 왼쪽으로 떨어뜨리기 */}
          <Svg42Logo />
          회원가입
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href="/password-reset" variant="body2">
              비밀번호를 잊으셨나요?
            </Link>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default LoginPage;
