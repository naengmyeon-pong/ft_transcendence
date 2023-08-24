'use client';
import {Menu, MenuItem, Typography} from '@mui/material';
import React, {useContext} from 'react';
import ServiceModal from './modal/ServiceModal';
import Kick from './service/Kick';
import Mute from './service/Mute';
import Ban from './service/Ban';
import {AddBlock, DelBlock} from './service/Block';
import {AddAdmin, DelAdmin} from './service/Admin';
import {UserProps} from '@/types/UserContext';
import {UserContext} from '@/components/layout/MainLayout/Context';
import Block from '@/components/Block';
import UserInfoPage from '@/components/UserProfileModal';

/*
 * @PARAM: 클릭당한 유저의 id, nickname, image를 가진 객체
 * @PARAM: 매개변수 유저의 권한
 * @PARAM: 현재 페이지에 접속한 유저의 권한
 */
function UserNode({user, permission, myPermission}: UserProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLLIElement | null>(null);
  const [modalState, setModalState] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<string | null>(null);
  const {chat_socket} = React.useContext(UserContext);
  const {block_users} = useContext(UserContext);
  const roomId = useContext(UserContext).convert_page.toString();
  const {user_id} = useContext(UserContext);
  const open = Boolean(anchorEl);

  function handleMenu(event: React.MouseEvent<HTMLLIElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuItemClick(menuItem: string) {
    setMenuItem(menuItem);
    setModalState(true);
    setAnchorEl(null);
  }

  function handleModalClose(confirmed: boolean) {
    if (confirmed && menuItem) {
      switch (menuItem) {
        case 'AddAdmin':
          AddAdmin(user, chat_socket, roomId);
          break;
        case 'DelAdmin':
          DelAdmin(user, chat_socket, roomId);
          break;
        case 'Kick':
          Kick(user, chat_socket, roomId);
          break;
        case 'Mute':
          Mute(user, chat_socket, roomId);
          break;
        case 'AddBlock':
          AddBlock(user, chat_socket, block_users);
          break;
        case 'DelBlock':
          DelBlock(user, chat_socket, block_users);
          break;
        case 'Ban':
          Ban(user, chat_socket, roomId);
          break;
        default:
          break;
      }
    }
    setModalState(false);
    setMenuItem(null);
    setAnchorEl(null);
  }

  function kickMuteBanPermission() {
    if (myPermission === 'owner') {
      return true;
    }
    if (myPermission === 'admin' && permission === 'user') {
      return true;
    }
    return false;
  }

  function delAdminMenu() {
    if (permission === 'admin' && myPermission === 'owner') {
      return true;
    }
    return false;
  }
  function addAdminMenu() {
    if (myPermission === 'owner' && permission !== 'admin') {
      return true;
    }
    return false;
  }

  function MenuOpen() {
    return (
      <Menu
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          marginLeft: '10px',
        }}
      >
        {delAdminMenu() && (
          <MenuItem onClick={() => handleMenuItemClick('DelAdmin')}>
            <Typography>채팅 관리자에서 제거</Typography>
          </MenuItem>
        )}
        {addAdminMenu() && (
          <MenuItem onClick={() => handleMenuItemClick('AddAdmin')}>
            <Typography>채팅 관리자로 추가</Typography>
          </MenuItem>
        )}
        {kickMuteBanPermission() && (
          <div>
            <MenuItem onClick={() => handleMenuItemClick('Kick')}>
              <Typography>강퇴</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Mute')}>
              <Typography>음소거(5분)</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Ban')}>
              <Typography>밴</Typography>
            </MenuItem>
          </div>
        )}
        {/* 차단, 차단해제 */}
        <Block
          block_user={user}
          component={MenuItem}
          onClose={() => setAnchorEl(null)}
        />
        <UserInfoPage user_info={user} menuClose={setAnchorEl} />
      </Menu>
    );
  }

  return (
    <>
      <li key={user.nickName}>
        <span onClick={handleMenu}>{user.nickName}</span>
      </li>
      {user_id !== user.id && open && MenuOpen()}
      {modalState && menuItem && (
        <ServiceModal
          modalState={modalState}
          onRequestClose={confirmed => handleModalClose(confirmed)}
          menuItem={menuItem}
          user={user}
        />
      )}
    </>
  );
}
export default UserNode;
