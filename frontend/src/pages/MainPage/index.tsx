import React from 'react';
import {Box, CssBaseline, Toolbar} from '@mui/material';
import {useLocation} from 'react-router-dom';

function MainLayout() {
  const {state} = useLocation();
  return (
    <React.Fragment>
      <div>hello</div>
    </React.Fragment>
  );
}

export default MainLayout;
