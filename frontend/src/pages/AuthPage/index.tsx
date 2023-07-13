import React from 'react';
import {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import axios from 'axios';
import apiManager from '@apiManager/apiManager';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
const HTTP_STATUS = require('http-status');

function AuthPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('code');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (token) {
        try {
          const response = await apiManager.get(`/auth/join/?code=${token}`);
          if (response.status === HTTP_STATUS.OK) {
            navigate('/signup', {state: response.data});
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.log(error.response);
            navigate('/', {state: error.response});
          }
        }
      }
    })();
  }, []);

  return (
    <React.Fragment>
      <CircularProgress sx={{mb: 3}} />
      <Typography>회원 정보를 확인하는 중입니다.</Typography>
    </React.Fragment>
  );
}

export default AuthPage;
