import {Typography} from '@mui/material';
import React from 'react';

interface ModalPrintInstance {
  menuItem: string | null;
  user: UserType;
}

// function ModalPrint({menuItem}: ModalPrintInstance) {
// function ModalPrint({menuItem}: {menuItem: string | null}) {
function ModalPrint({user, menuItem}: ModalPrintInstance) {
  let title;
  let detail;
  console.log(user);
  function getTitle() {
    switch (menuItem) {
      case 'addAdmin':
        title = '채팅관리자 추가';
        break;
      case 'Kick':
        title = '강퇴';
        break;
      case 'Mute':
        title = '음소거(5분)';
        break;
      case 'Block':
        title = '차단';
        break;
      case 'Ban':
        title = '밴';
        break;
      default:
        break;
    }
  }
  function getDetail() {
    switch (menuItem) {
      case 'addAdmin':
        detail = ' 님을 채팅 관리자로 추가하시겠습니까?';
        break;
      case 'Kick':
        detail = ' 님을 채팅에서 강퇴하시겠습니까?';
        break;
      case 'Mute':
        detail = ' 님을 음소거 시키시겠습니까?';
        break;
      case 'Block':
        detail = ' 님을 차단하시겠습니까?';
        break;
      case 'Ban':
        detail = ' 님을 밴하시겠습니까?';
        break;
      default:
        break;
    }
  }
  getTitle();
  getDetail();
  console.log('title: ', title, ' detail:', detail);
  return (
    <>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1">
        <span style={{fontWeight: 'bold'}}> {user.nickName}</span>
        <span>{detail}</span>
      </Typography>
    </>
  );
}

export default ModalPrint;
