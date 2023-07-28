import {UserContext} from 'Context';
import React, {useContext} from 'react';
import {useParams} from 'react-router-dom';
import {Socket} from 'socket.io-client';

function AddAdmin(
  user: UserType,
  socket: Socket | null,
  roomId: string | undefined
) {
  socket?.emit('add-admin', {room_id: roomId, target_id: user?.id});
  console.log('AddAdmin');
}

export default AddAdmin;
