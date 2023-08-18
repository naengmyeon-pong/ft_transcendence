'use client';

import {UserType} from '@/types/UserContext';
import {Box, Button, Typography} from '@mui/material';
import React, {ReactNode, useCallback, useContext} from 'react';
import {UserContext} from '@/components/layout/MainLayout/Context';
import {AddBlock, DelBlock} from '../Chat/RoomPage/service/Block';
import {useGlobalModal} from '@/hooks/useGlobalModal';

type CustomComponentType = React.ComponentType<{
  children: ReactNode;
  onClick: () => void;
}>;

interface BlockType {
  block_user: UserType;
  component: CustomComponentType;
  onClose?: () => void;
}

export default function Block({
  block_user,
  component: Component,
  onClose,
}: BlockType) {
  const {chat_socket, block_users} = useContext(UserContext);
  const {openGlobalModal, closeGlobalModal} = useGlobalModal();
  const is_block = !block_users.has(`${block_user.id}`);

  const content = useCallback(() => {
    return (
      <Typography variant="body1">
        <span style={{fontWeight: 'bold'}}> {block_user.nickName}</span>
        <span>{` 님을 ${is_block ? '차단' : '차단해제'}하시겠습니까?`}</span>
      </Typography>
    );
  }, [is_block, block_user.nickName]);

  const handleBlock = useCallback(() => {
    if (is_block) {
      AddBlock(block_user, chat_socket, block_users);
    } else {
      DelBlock(block_user, chat_socket, block_users);
    }
    if (onClose !== undefined) {
      onClose();
    }
    closeGlobalModal();
  }, [
    block_user,
    block_users,
    closeGlobalModal,
    is_block,
    onClose,
    chat_socket,
  ]);

  const action = useCallback(() => {
    return (
      <Box display={'flex'} justifyContent={'space-between'}>
        <Button onClick={handleBlock}>예</Button>
        <Button onClick={closeGlobalModal}>아니오</Button>
      </Box>
    );
    // };
  }, [handleBlock, closeGlobalModal]);

  function handleModalOpen() {
    openGlobalModal({
      title: `${is_block ? '차단' : '차단해제'}`,
      content: content(),
      action: action(),
    });
  }

  return (
    <>
      <Component onClick={handleModalOpen}>
        {!block_users.has(`${block_user.id}`) ? '차단' : '차단해제'}
      </Component>
    </>
  );
}
