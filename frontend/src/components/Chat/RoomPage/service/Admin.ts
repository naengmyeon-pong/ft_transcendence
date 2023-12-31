import {UserType} from '@/types/UserContext';
import React from 'react';
import {Socket} from 'socket.io-client';

export function AddAdmin(
  user: UserType,
  chat_socket: Socket | null,
  roomId: string | null
) {
  chat_socket?.emit('add-admin', {room_id: roomId, target_id: user?.id});
}

export function DelAdmin(
  user: UserType,
  chat_socket: Socket | null,
  roomId: string | null
) {
  chat_socket?.emit('del-admin', {room_id: roomId, target_id: user?.id});
}
