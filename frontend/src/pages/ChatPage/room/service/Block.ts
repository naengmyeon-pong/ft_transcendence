import React from 'react';
import {Socket} from 'socket.io-client';

// TODO: 유저를 추방 후 채널에 들어오지 못하게하는 기능
function AddBlock(
  user: UserType,
  socket: Socket | null,
  block_users: Set<string>,
  setBlockUsers: (block_users: Set<string>) => void
) {
  console.log(user?.id);
  socket?.emit('block-member', user?.id);

  const tmp = new Set<string>(block_users);
  tmp.add(user?.id);
  block_users.add(user?.id);
  setBlockUsers(tmp);
}

export default AddBlock;
