import React from 'react';
import {Socket} from 'socket.io-client';

// TODO: 유저를 추방 후 채널에 들어오지 못하게하는 기능
function Block(
  user: UserType,
  socket: Socket | null,
  roomId: string | undefined
) {
  console.log('Block');
}

export default Block;
