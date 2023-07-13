import React, {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {useNavigate} from 'react-router-dom';

function PasswordResetPage() {
  const [passwd, setPasswd] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const navi = useNavigate();

  function validatePasswordLength(password: string): boolean {
    // 8~20자 제한
    if (password.length > 7 && password.length < 21) {
      return true;
    }
    return false;
  }

  function validatePasswordChar(password: string): boolean {
    // 대문자, 소문자, 특수문자 각각 하나 이상
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return regex.test(password);
  }

  //성공했을경우만 버튼이 활성화가 됩니다
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('password'), data.get('passwordConfirm'));
    // TODO: 위치지정
    navi('/');
    //실패했을 경우 지정해줘야함
  };

  function handlePasswd(e: React.ChangeEvent<HTMLInputElement>) {
    setPasswd(e.target.value);
  }
  function handlePasswordConfirm(e: React.ChangeEvent<HTMLInputElement>) {
    setPasswordConfirm(e.target.value);
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h5">
        비밀번호 재설정
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar src={'인트라이미지'} />
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
            {passwd === '' || validatePasswordLength(passwd) ? (
              passwd === '' || validatePasswordChar(passwd) ? (
                <TextField
                  required
                  fullWidth
                  id="password"
                  name="password"
                  label="비밀번호"
                  type="password"
                  autoComplete="current-password"
                  onChange={handlePasswd}
                />
              ) : (
                <TextField
                  error
                  fullWidth
                  id="password"
                  name="password"
                  label="비밀번호"
                  type="password"
                  autoComplete="current-password"
                  onChange={handlePasswd}
                  helperText="비밀번호는 영문 대/소문자, 숫자, 특수문자 조합이여야 합니다."
                />
              )
            ) : (
              <TextField
                error
                fullWidth
                id="password"
                name="password"
                label="비밀번호"
                type="password"
                autoComplete="current-password"
                onChange={handlePasswd}
                helperText="비밀번호는 8 ~ 20 사이입니다."
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {passwordConfirm === '' ||
            validatePasswordLength(passwordConfirm) ? (
              passwordConfirm === '' ||
              validatePasswordChar(passwordConfirm) ? (
                <TextField
                  required
                  fullWidth
                  id="passwordConfirm"
                  name="passwordConfirm"
                  label="비밀번호 재확인"
                  type="password"
                  autoComplete="current-password"
                  onChange={handlePasswordConfirm}
                />
              ) : (
                <TextField
                  error
                  fullWidth
                  id="passwordConfirm"
                  name="passwordConfirm"
                  label="비밀번호 재확인"
                  type="password"
                  autoComplete="current-password"
                  onChange={handlePasswordConfirm}
                  helperText="비밀번호는 영문 대/소문자, 숫자, 특수문자 조합이여야 합니다."
                />
              )
            ) : (
              <TextField
                error
                fullWidth
                id="passwordConfirm"
                name="passwordConfirm"
                label="비밀번호 재확인"
                type="password"
                autoComplete="current-password"
                onChange={handlePasswordConfirm}
                helperText="비밀번호는 8 ~ 20 사이입니다."
              />
            )}
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
                    // color={
                    //   isLengthGood && firstPassword !== ''
                    //     ? 'success'
                    //     : 'disabled'
                    // }
                    color={
                      validatePasswordLength(passwd) ? 'success' : 'disabled'
                    }
                    // color="success"
                  ></CheckIcon>
                </ListItemIcon>
                {/* TODO: 규칙 준수 여부에 따라 텍스트 색상 변경 */}
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
                    // color={
                    //   isRuleGood && firstPassword !== '' ? 'success' : 'disabled'
                    // }
                    color={
                      validatePasswordChar(passwd) ? 'success' : 'disabled'
                    }
                    // color="success"
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
        </Grid>
        {passwd === passwordConfirm &&
        validatePasswordChar(passwd) &&
        validatePasswordLength(passwd) ? (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
          >
            수정하기
          </Button>
        ) : (
          <Button disabled fullWidth variant="contained" sx={{mt: 3, mb: 2}}>
            수정하기
          </Button>
        )}
      </Box>
    </React.Fragment>
  );
}

export default PasswordResetPage;
