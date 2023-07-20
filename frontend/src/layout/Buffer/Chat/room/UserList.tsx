import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Modal,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

// function UserList(users: UserType[], adminUsers: Boolean = false) {
// permission: user=0, admin=1
function UserList({user}: UserProps) {
  const [menuState, setMenuState] = useState(false);
  const test = menuState;

  function handleMenu() {
    setMenuState(!menuState);
  }

  function handleClick() {
    return (
      <>
        <Typography>채팅 관리자로 추가</Typography>
        <Typography>강퇴</Typography>
      </>
    );
  }
  const handleClose = () => {
    setMenuState(false);
  };

  return (
    <ul>
      {/* {users.map(node => {
        return ( */}
      <>
        {/* <List
              sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}
              component="nav"
              aria-labelledby="nested-list-subheader"
            > */}
        {/* <ListItemButton onClick={handleClick}> */}
        <li key={user.nickName} onClick={handleMenu}>
          {user.nickName}
        </li>
        {test ? handleClick() : <></>}
        {/* </ListItemButton>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{pl: 4}}>
                    <ListItemText primary="채팅 관리자로 추가" />
                  </ListItemButton>
                  <ListItemButton sx={{pl: 4}}>
                    <ListItemText primary="강퇴" />
                  </ListItemButton>
                  <ListItemButton sx={{pl: 4}}>
                    <ListItemText primary="음소거 5분" />
                  </ListItemButton>
                </List>
              </Collapse>
            </List> */}
      </>
      {/* );
       })} */}
    </ul>
  );
}
export default UserList;
