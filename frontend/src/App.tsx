import React from 'react';
import './App.css';
import {Route, Routes} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginLayout from './layout/LoginLayout';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route element={<LoginLayout />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
