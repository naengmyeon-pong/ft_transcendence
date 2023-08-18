import {UserType} from '@/types/UserContext';
import React from 'react';
import {Socket} from 'socket.io-client';

export function AddBlock(
  user: UserType,
  chat_socket: Socket | null,
  block_users: Map<string, UserType>
) {
  chat_socket?.emit('block-member', user?.id);
  block_users.set(user?.id, user);
}

export function DelBlock(
  user: UserType,
  chat_socket: Socket | null,
  block_users: Map<string, UserType>
) {
  chat_socket?.emit('unblock-member', user?.id);
  block_users.delete(user?.id);
}
