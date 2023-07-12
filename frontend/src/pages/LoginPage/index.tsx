import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function LoginPage() {
  return (
    <div style={{height: '100vh'}}>
      <div>
        <Avatar
          alt="프로필 사진"
          src={`${process.env.PUBLIC_URL}/Naengmyeon.png`}
        />
      </div>
      <Typography>Welcome to</Typography>
      <Typography>Naengmyeon pong</Typography>
      <TextField
        margin="normal"
        name="username"
        label="아이디"
        required
        autoFocus
        autoComplete="username"
      />
      <TextField
        margin="normal"
        name="password"
        label="비밀번호"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button variant="contained" size="large" type="submit">
        Login
      </Button>
      <Button
        sx={{
          marginTop: '10px',
          width: '300px',
          backgroundColor: '#323232',
        }}
        variant="contained"
        size="large"
        // onClick={signFortyTwo}
      >
        sign up with 42
      </Button>
    </div>
  );
}

export default LoginPage;
