import React from 'react';
import {useState, useRef} from 'react';
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
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import apiManager from '@apiManager/apiManager';
import Alert from '@mui/material/Alert';

const ALLOWED_IMAGE_FILE_EXTENSION = 'image/jpg, image/jpeg, image/png';
const ALLOWED_IMAGE_FILE_EXTENSIONS_STRING = ALLOWED_IMAGE_FILE_EXTENSION.split(
  ','
)
  .map(extension => {
    return extension.split('/')[1];
  })
  .join(' ');
const FILE_SIZE_MAX_LIMIT = 1 * 1024 * 1024; // 1MB

function SignupPage() {
  const {state} = useLocation();
  const {user_id} = state;
  const user_image =
    state.user_image === null
      ? `${process.env.PUBLIC_URL}/logo.jpeg`
      : state.user_image;

  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // 8~20자 제한
  const isValidPasswordLength = (password: string): boolean => {
    if (8 <= password.length && password.length <= 20) {
      return true;
    }
    return false;
  };

  // 2~8자 제한
  const isValidNicknameLength = (nickname: string): boolean => {
    if (2 <= nickname.length && nickname.length <= 8) {
      return true;
    }
    return false;
  };

  const isValidPasswordRule = (password: string): boolean => {
    // 대문자, 소문자, 특수문자 각각 하나 이상
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\d\sa-zA-Z])[\S]{8,}$/;
    return regex.test(password);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadImageFile, setUploadImageFile] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [isUniqueNickname, setIsUniqueNickname] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  const handleUploadImageRemoval = () => {
    if (uploadImageFile === '') {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input value
    }
    setUploadImageFile('');
  };

  const extractFileExtension = (name: string): string => {
    const lastCommaIndex = name.lastIndexOf('.');
    if (lastCommaIndex === -1) {
      return '';
    }
    return name.substring(lastCommaIndex + 1).toLowerCase();
  };

  const isAllowedImageExtension = (extension: string): boolean => {
    if (
      ALLOWED_IMAGE_FILE_EXTENSION.indexOf(extension) === -1 ||
      extension === ''
    ) {
      return false;
    }
    return true;
  };

  const isValidImageExtension = ({name}: {name: string}): boolean => {
    const extension = extractFileExtension(name);

    if (isAllowedImageExtension(extension) === false) {
      return false;
    }
    return true;
  };

  const isFileSizeExceeded = (size: number): boolean => {
    if (size > FILE_SIZE_MAX_LIMIT) {
      return true;
    }
    return false;
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target.files;
    console.log(target.files);
    if (files === undefined) {
      return;
    }

    const file = files?.[0];
    if (file === undefined || file === null) {
      return;
    }

    console.log(file);
    if (isValidImageExtension(file) === false) {
      target.value = '';
      // TODO: snackbar 표시하기
      console.log(
        `확장자는 ${ALLOWED_IMAGE_FILE_EXTENSIONS_STRING}만 가능합니다.`
      );
      return;
    }

    if (isFileSizeExceeded(file.size) === true) {
      target.value = '';
      // TODO: snackbar 표시하기
      console.log(
        `파일 크기는 ${FILE_SIZE_MAX_LIMIT / 1024 / 1024}MB 이하로 제한됩니다.`
      );
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUploadImageFile(reader.result);
      }
    };
  };

  const handleErrorSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenErrorSnackbar(false);
  };

  const handle2FA = () => {
    setIs2faEnabled(!is2faEnabled);
  };

  const handleNicknameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setIsUniqueNickname(false);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleDuplicatedNickname = async () => {
    if (isValidNicknameLength(nickname) === false) {
      setOpenSnackbar(true);
      return;
    }
    setOpenDialog(true);
    const response = await apiManager.get(
      `/signup/nickname?user_id=${user_id}&nickname=${nickname}`
    );
    try {
      if (response.data === true) {
        setIsUniqueNickname(true);
      } else {
        setIsUniqueNickname(false);
      }
      console.log(response);
    } catch (error: unknown) {
      console.log(error);
      setOpenErrorSnackbar(true);
    }
  };

  //성공했을경우만 버튼이 활성화가 됩니다
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      user_id: user_id,
      user_pw: password,
      user_nickname: nickname,
      user_image: user_image,
      is_2fa_enabled: is2faEnabled,
    };
    console.log(data);
    // const response = await apiManager.post('/signup', data);
    // try {
    //   console.log(response);
    // } catch (error) {
    //   console.log(error);
    //   setOpenErrorSnackbar(true);
    // }
    // TODO: 위치지정
    // navigate('/');
    //실패했을 경우 지정해줘야함
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
                avatar={<Avatar src={uploadImageFile || user_image} />}
                title="프로필 사진"
                subheader="기본 이미지는 인트라 이미지로 설정됩니다"
              />
              <Box display="flex" justifyContent="flex-end">
                {uploadImageFile && (
                  <Button
                    onClick={handleUploadImageRemoval}
                    sx={{color: 'grey'}}
                  >
                    제거
                  </Button>
                )}
                <label htmlFor="file-upload-button">
                  <input
                    type="file"
                    id="file-upload-button"
                    accept={ALLOWED_IMAGE_FILE_EXTENSION}
                    onChange={handleUploadFile}
                    hidden
                    ref={fileInputRef}
                  />
                  <Button component="span">업로드</Button>
                </label>
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
            <Snackbar
              open={openSnackbar}
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
              autoHideDuration={3000}
              onClose={handleSnackbarClose}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity="error"
                sx={{width: '100%'}}
              >
                닉네임의 길이를 확인해주세요. (현재 길이: {nickname.length}자)
              </Alert>
            </Snackbar>
            <Dialog
              open={openDialog}
              onClose={handleDialogClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">중복 확인</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {nickname}
                  {isUniqueNickname === true
                    ? ' 은(는) 사용 가능합니다.'
                    : ' 은(는) 사용 불가능합니다.'}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} autoFocus>
                  닫기
                </Button>
              </DialogActions>
            </Dialog>
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
          disabled={
            password !== confirmPassword ||
            isUniqueNickname === false ||
            (isValidPasswordLength(password) === false &&
              isValidPasswordRule(password) === false)
          }
          fullWidth
          type="submit"
          variant="contained"
          sx={{mt: 3, mb: 2}}
        >
          회원가입
        </Button>
        <Snackbar
          open={openErrorSnackbar}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
          autoHideDuration={6000}
          onClose={handleErrorSnackbarClose}
        >
          <Alert
            onClose={handleErrorSnackbarClose}
            severity="warning"
            sx={{width: '100%'}}
          >
            오류가 발생했습니다. 다시 한번 시도해주세요.
          </Alert>
        </Snackbar>
      </Box>
    </React.Fragment>
  );
}

export default SignupPage;
