import React from 'react';
import {Socket} from 'socket.io-client';

export function AddBlock(
  user: UserType,
  socket: Socket | null,
  block_users: Set<string>
) {
  console.log(user?.id);
  socket?.emit('block-member', user?.id);

  block_users.add(user?.id);
}

export function DelBlock(
  user: UserType,
  socket: Socket | null,
  block_users: Set<string>
) {
  console.log(user?.id);
  socket?.emit('unblock-member', user?.id);

  block_users.delete(user?.id);
}
