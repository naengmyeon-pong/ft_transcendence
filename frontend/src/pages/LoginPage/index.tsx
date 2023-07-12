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

function LoginPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };
  return (
    // <div style={{height: '100vh'}}>
    //   <div>
    //     <Avatar
    //       alt="프로필 사진"
    //       src={`${process.env.PUBLIC_URL}/Naengmyeon.png`}
    //     />
    //   </div>
    //   <Typography>Welcome to</Typography>
    //   <Typography>Naengmyeon pong</Typography>
    //   <TextField
    //     margin="normal"
    //     name="username"
    //     label="아이디"
    //     required
    //     autoFocus
    //     autoComplete="username"
    //   />
    //   <TextField
    //     margin="normal"
    //     name="password"
    //     label="비밀번호"
    //     type="password"
    //     autoComplete="current-password"
    //     required
    //   />
    //   <Button variant="contained" size="large" type="submit">
    //     Login
    //   </Button>
    //   <Button
    //     sx={{
    //       marginTop: '10px',
    //       width: '300px',
    //       backgroundColor: '#323232',
    //     }}
    //     variant="contained"
    //     size="large"
    //     // onClick={signFortyTwo}
    //   >
    //     sign up with 42
    //   </Button>
    // </div>

    <>
      <Avatar
        sx={{m: 1}}
        alt="logo"
        src={`${process.env.PUBLIC_URL}/logo.jpeg`}
      />
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
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
          label="Remember me"
        />
        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
          Sign In
        </Button>
        <Grid container>
          <Grid item xs>
            <Link href="#" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default LoginPage;
