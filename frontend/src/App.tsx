import React from 'react';
import './App.css';
import {Route, Routes} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import LoginLayout from './layout/LoginLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PasswordResetPage from './pages/PasswordResetPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route element={<LoginLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
