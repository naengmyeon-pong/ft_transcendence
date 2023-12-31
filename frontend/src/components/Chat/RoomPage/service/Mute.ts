import {UserType} from '@/types/UserContext';
import React from 'react';
import {Socket} from 'socket.io-client';

function Mute(
  user: UserType,
  chat_socket: Socket | null,
  roomId: string | null
  // roomId: string | undefined
) {
  chat_socket?.emit('mute-member', {
    room_id: roomId,
    target_id: user?.id,
    mute_time: new Date().getTime(),
  });
}

export default Mute;
