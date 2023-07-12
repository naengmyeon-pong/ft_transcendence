import React from 'react';
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
      <Typography component="h1" variant="h5">
        회원가입
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                avatar={<Avatar src={'인트라이미지'} />}
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
              defaultValue="API에서 가져온 인트라ID"
              variant="filled"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="password"
              name="password"
              label="비밀번호"
              type="password"
              autoComplete="current-password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="passwordConfirm"
              name="passwordConfirm"
              label="비밀번호 재확인"
              type="password"
              autoComplete="current-password"
            />
          </Grid>
          <Grid item xs={12}>
            <List
              sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
            >
              <ListItem color="success">
                <ListItemIcon>
                  <CheckIcon
                    // color={
                    //   isLengthGood && firstPassword !== ''
                    //     ? 'success'
                    //     : 'disabled'
                    // }
                    color="success"
                  ></CheckIcon>
                </ListItemIcon>
                {/* TODO: 규칙 준수 여부에 따라 텍스트 색상 변경 */}
                <ListItemText
                  disableTypography
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
                    // color={
                    //   isRuleGood && firstPassword !== '' ? 'success' : 'disabled'
                    // }
                    color="success"
                  ></CheckIcon>
                </ListItemIcon>
                {/* TODO: 규칙 준수 여부에 따라 텍스트 색상 변경 */}
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
        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
          회원가입
        </Button>
      </Box>
    </React.Fragment>
  );
}

export default SignupPage;
