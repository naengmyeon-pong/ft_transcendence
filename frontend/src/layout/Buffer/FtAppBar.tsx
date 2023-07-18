import React from 'react';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {MouseEvent, useState} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {Link} from 'react-router-dom';

const customTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'black',
          marginLeft: '1em',
        },
      },
    },
  },
});

const otherMenu = ['게임하기', '전체랭킹', '채팅목록'];
const userMenu = ['알람', '마이페이지', '로그아웃'];

function FtAppBar() {
  console.log('AppBar');
  const [anchorElOther, setAnchorElOther] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenOtherMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElOther(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseOtherMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElOther(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
        }}
      >
        <Toolbar>
          {/* sm환경: 화면 줄어든 상황, 가로 600 */}
          <Box
            sx={{
              flexGrow: 1,
              display: {xs: 'flex', sm: 'none'},
            }}
          >
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenOtherMenu}
              color="inherit"
            >
              <MenuIcon sx={{color: 'black'}} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElOther}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElOther)}
              onClose={handleCloseOtherMenu}
              sx={{
                display: {xs: 'block', sm: 'none'},
                color: 'black',
              }}
            >
              {otherMenu.map(page => (
                <MenuItem key={page} onClick={handleCloseOtherMenu}>
                  <Typography textAlign="center" sx={{color: 'black'}}>
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{flexGrow: 1, display: {xs: 'flex', sm: 'none'}}}
          >
            <img
              src="/Naengmyeon.png"
              style={{objectFit: 'cover', width: '40px'}}
              alt="냉면사진"
            />
          </Typography>
          <Box sx={{display: {xs: 'block', sm: 'none'}}}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenUserMenu}
              color="inherit"
            >
              <MenuIcon sx={{color: 'black'}} />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              sx={{
                color: 'black',
              }}
            >
              {userMenu.map(page => (
                <MenuItem key={page} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center" sx={{color: 'black'}}>
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* xs:태블릿정도 md환경: 평소 브라우저상황 */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{display: {xs: 'none', sm: 'flex'}}}
          >
            <img
              src="/Naengmyeon.png"
              style={{objectFit: 'cover', width: '40px'}}
              alt="냉면사진"
            />
          </Typography>
          <Box sx={{flexGrow: 1, display: {xs: 'none', sm: 'flex'}}}>
            <Link to="/">
              <Button>게임하기</Button>
            </Link>
            <Link to="/menu/ranking">
              <Button>전체랭킹</Button>
            </Link>
            <Button>채팅목록</Button>
          </Box>
          <Box sx={{flexGrow: 0, display: {xs: 'none', sm: 'flex'}}}>
            <Button>
              <NotificationsIcon sx={{color: 'black'}} />
            </Button>
            <Button>마이페이지</Button>
            <Button>로그아웃</Button>
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default FtAppBar;