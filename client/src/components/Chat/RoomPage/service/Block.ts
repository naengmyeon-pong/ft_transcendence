import {UserType} from '@/types/UserContext';
import React from 'react';
import {Socket} from 'socket.io-client';

export function AddBlock(
  user: UserType,
  socket: Socket | null,
  block_users: Map<string, UserType>
) {
  socket?.emit('block-member', user?.id);
  block_users.set(user?.id, user);
}

export function DelBlock(
  user: UserType,
  socket: Socket | null,
  block_users: Map<string, UserType>
) {
  socket?.emit('unblock-member', user?.id);
  block_users.delete(user?.id);
}
