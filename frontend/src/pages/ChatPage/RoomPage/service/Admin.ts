import React from 'react';
import {Socket} from 'socket.io-client';

export function AddAdmin(
  user: UserType,
  socket: Socket | null,
  roomId: string | null
) {
  socket?.emit('add-admin', {room_id: roomId, target_id: user?.id});
  console.log('AddAdmin');
}

export function DelAdmin(
  user: UserType,
  socket: Socket | null,
  roomId: string | null
) {
  socket?.emit('del-admin', {room_id: roomId, target_id: user?.id});
  console.log('DelAdmin');
}
