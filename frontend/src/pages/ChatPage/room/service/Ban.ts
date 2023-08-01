import React from 'react';
import {Socket} from 'socket.io-client';

// TODO: 유저를 추방 후 채널에 들어오지 못하게하는 기능
function Ban(
  user: UserType,
  socket: Socket | null,
  roomId: string | undefined
) {
  socket?.emit('ban-member', {room_id: roomId, target_id: user?.id});
  console.log('Ban');
}

export default Ban;
