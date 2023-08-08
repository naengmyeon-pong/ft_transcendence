import React, {useState} from 'react';
import './App.css';
import {Route, Routes} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import LoginLayout from './layout/LoginLayout';
import LoginPage from './pages/LoginPage';
import AuthPage from './pages/AuthPage';
import SignupPage from './pages/SignupPage';
import PasswordResetPage from './pages/PasswordResetPage';
import NotFoundPage from './pages/NotFoundPage';
import MainPage from 'layout/Buffer/MainPage/MainPage';
import Ranking from 'layout/Buffer/Ranking';
import MainLayout from 'layout/MainLayout';
import {UserProvider} from 'Context';
import ChatPage from 'pages/ChatPage';

function App() {
  return (
    <>
      <UserProvider>
        <CssBaseline />
        <Routes>
          <Route element={<LoginLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/menu/mainPage" element={<MainPage />} />
            <Route path="/menu/ranking" element={<Ranking />} />
            <Route path="/menu/chat" element={<ChatPage />} />
          </Route>
          {/* 마이페이지 링크 추가 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </>
  );
}

export default App;
