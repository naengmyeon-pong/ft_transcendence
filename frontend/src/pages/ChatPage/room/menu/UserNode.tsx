import {Menu, MenuItem, Typography} from '@mui/material';
import React, {useContext} from 'react';
import ServiceModal from '../service/ServiceModal';
import AddAdmin from '../service/AddAdmin';
import Block from '../service/Block';
import Kick from '../service/Kick';
import Mute from '../service/Mute';
import Ban from '../service/Ban';
import {UserContext} from 'Context';
import {useParams} from 'react-router-dom';
import DelAdmin from '../service/DelAdmin';

/*
 * @PARAM: 클릭당한 유저의 id, nickname, image를 가진 객체
 * @PARAM: 매개변수 유저의 권한
 * @PARAM: 현재 페이지에 접속한 유저의 권한
 */
function UserNode({user, permission, myPermission}: UserProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLLIElement | null>(null);
  const [modalState, setModalState] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<string | null>(null);
  const socket = React.useContext(UserContext).socket;
  const {roomId} = useParams();
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
          AddAdmin(user, socket, roomId);
          break;
        case 'DelAdmin':
          DelAdmin(user, socket, roomId);
          break;
        case 'Kick':
          Kick(user, socket, roomId);
          break;
        case 'Mute':
          Mute(user, socket, roomId);
          break;
        case 'Block':
          Block(user, socket, roomId);
          break;
        case 'Ban':
          Ban(user, socket, roomId);
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
        {/* TODO: 유저의 권한별로 설정해줘야 합니다 */}

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

        <MenuItem onClick={() => handleMenuItemClick('Block')}>
          <Typography>차단</Typography>
        </MenuItem>
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
