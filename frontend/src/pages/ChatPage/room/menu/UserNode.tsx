import {Menu, MenuItem, Typography} from '@mui/material';
import React from 'react';
import ServiceModal from '../service/ServiceModal';
import AddAdmin from '../service/AddAdmin';
import Block from '../service/Block';
import Kick from '../service/Kick';
import Mute from '../service/Mute';
import Ban from '../service/Ban';
import {UserContext} from 'Context';
import {useParams} from 'react-router-dom';

function UserNode({user}: UserProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLLIElement | null>(null);
  const [modalState, setModalState] = React.useState(false);
  const [menuItem, setMenuItem] = React.useState<string | null>(null);
  const socket = React.useContext(UserContext).socket;
  const {roomId} = useParams();
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
        case 'addAdmin':
          AddAdmin(user, socket, roomId);
          break;
        case 'Kick':
          Kick(user);
          break;
        case 'Mute':
          Mute(user);
          break;
        case 'Block':
          Block(user);
          break;
        case 'Ban':
          Ban(user);
          break;
        default:
          break;
      }
    }
    setModalState(false);
    setMenuItem(null);
    setAnchorEl(null);
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
        <MenuItem onClick={() => handleMenuItemClick('addAdmin')}>
          <Typography>채팅 관리자로 추가</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Kick')}>
          <Typography>강퇴</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Mute')}>
          <Typography>음소거(5분)</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Block')}>
          <Typography>차단</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Ban')}>
          <Typography>밴</Typography>
        </MenuItem>
      </Menu>
    );
  }

  return (
    <>
      <li key={user.nickName}>
        <span onClick={handleMenu}>{user.nickName}</span>
      </li>
      {open && MenuOpen()}
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
