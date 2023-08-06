import React from 'react';
import {Socket} from 'socket.io-client';

function Ban(user: UserType, socket: Socket | null, roomId: string | null) {
  socket?.emit('ban-member', {room_id: roomId, target_id: user?.id});
  console.log('Ban');
}

export default Ban;
