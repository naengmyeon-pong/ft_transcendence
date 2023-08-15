import {UserType} from '@/types/UserContext';
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
  function getTitle() {
    switch (menuItem) {
      case 'AddAdmin':
        title = '채팅관리자 추가';
        break;
      case 'DelAdmin':
        title = '채팅관리자 제거';
        break;
      case 'Kick':
        title = '강퇴';
        break;
      case 'Mute':
        title = '음소거(5분)';
        break;
      case 'AddBlock':
        title = '차단';
        break;
      case 'DelBlock':
        title = '차단해제';
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
      case 'AddAdmin':
        detail = ' 님을 채팅 관리자로 추가하시겠습니까?';
        break;
      case 'DelAdmin':
        detail = ' 님을 채팅 관리자에서 제거하시겠습니까?';
        break;
      case 'Kick':
        detail = ' 님을 채팅에서 강퇴하시겠습니까?';
        break;
      case 'Mute':
        detail = ' 님을 음소거 시키시겠습니까?';
        break;
      case 'AddBlock':
        detail = ' 님을 차단하시겠습니까?';
        break;
      case 'DelBlock':
        detail = ' 님을 차단해제하시겠습니까?';
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
  console.log('title: ', title, ' detail:', detail, 'menuItem', menuItem);
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
