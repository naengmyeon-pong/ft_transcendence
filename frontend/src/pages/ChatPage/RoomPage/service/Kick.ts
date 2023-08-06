import React from 'react';
import {Socket} from 'socket.io-client';

function Kick(
  user: UserType,
  socket: Socket | null,
  roomId: string | null
  // roomId: string | undefined
) {
  socket?.emit('kick-member', {room_id: roomId, target_id: user?.id});
  console.log('Kick');
}

export default Kick;
