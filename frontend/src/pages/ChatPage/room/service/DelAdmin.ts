import React from 'react';
import {Socket} from 'socket.io-client';

function DelAdmin(
  user: UserType,
  socket: Socket | null,
  roomId: string | null
  // roomId: string | undefined
) {
  socket?.emit('del-admin', {room_id: roomId, target_id: user?.id});
  console.log('DelAdmin');
}

export default DelAdmin;
