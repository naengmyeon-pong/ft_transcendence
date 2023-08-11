'use client';
import React, {useContext, useEffect} from 'react';
import {MouseEvent, useState} from 'react';
import Link from 'next/link';
import logo from '@/public/logo.jpeg';
import {
  AppBar,
  Avatar,
  Badge,
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
import MenuIcon from '@mui/icons-material/Menu';
import {Notificate} from '@/types/UserContext';
import {UserContext} from './Context';
import {useRouter} from 'next/router';

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

// TODO: 각 항목마다 링크, 사이즈 작을경우 대처, 마이페이지, 로그아웃이 필요합니다
function CustomAppBar() {
  console.log('AppBar');
  const [anchorElOther, setAnchorElOther] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [notificate_menu, setNotificateMenu] =
    React.useState<null | HTMLElement>(null);
  const notificate_open = Boolean(notificate_menu);
  const [notificates, setNotificates] = useState<Notificate[]>([]);
  const [read_notificate, setReadNotificate] = useState<boolean>(false);
  const {socket, setConvertPage} = useContext(UserContext);
  const navigate = useRouter();

  const handleOpenOtherMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElOther(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseOtherMenu = () => {
    setAnchorElOther(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    function handleChatNotification(rep: Notificate) {
      setNotificates(preNotis => [...preNotis, rep]);
      setReadNotificate(true);
    }
    socket?.on('chatroom-notification', handleChatNotification);
  }, []);

  function handleNotificate(event: MouseEvent<HTMLElement>) {
    setReadNotificate(false);
    setNotificateMenu(event.currentTarget);
  }
  function handleNotificateMenuClose() {
    setNotificateMenu(null);
  }

  function handleSendRoom(row: Notificate, index: number) {
    notificates.splice(index, 1);
    setConvertPage(Number(row.room_id));
    navigate.push('/menu/chat');
  }

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
            <Avatar alt="로고" src={logo.src} />
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
            <Avatar alt="로고" src={logo.src} />
          </Typography>
          <Box sx={{flexGrow: 1, display: {xs: 'none', sm: 'flex'}}}>
            <Link href="/main/game">
              <Button>게임하기</Button>
            </Link>
            <Link href="/main/chat">
              {/* <Link to="/menu/chat/list"> */}
              <Button>채팅목록</Button>
            </Link>
          </Box>
          <Box sx={{flexGrow: 0, display: {xs: 'none', sm: 'flex'}}}>
            <IconButton
              onClick={handleNotificate}
              aria-label="more"
              id="long-button"
              aria-controls={notificate_open ? 'long-menu' : undefined}
              aria-expanded={notificate_open ? 'true' : undefined}
              aria-haspopup="true"
            >
              {read_notificate ? (
                <Badge
                  overlap="circular"
                  color="error"
                  anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                  variant="dot"
                >
                  <NotificationsIcon sx={{color: 'black'}} />
                </Badge>
              ) : (
                <NotificationsIcon sx={{color: 'black'}} />
              )}
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={notificate_menu}
              open={notificate_open}
              onClose={handleNotificateMenuClose}
            >
              {notificates.map((row, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleSendRoom(row, index)}
                >
                  <Typography>
                    {`${row.user_id}님이 채팅방으로 초대하였습니다`}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
            <Button>마이페이지</Button>
            <Button>로그아웃</Button>
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default CustomAppBar;
