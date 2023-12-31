import {UserType} from '@/types/UserContext';
import React from 'react';
import {Socket} from 'socket.io-client';

function Ban(
  user: UserType,
  chat_socket: Socket | null,
  roomId: string | null
) {
  chat_socket?.emit('ban-member', {room_id: roomId, target_id: user?.id});
}

export default Ban;
