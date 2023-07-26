import React, {
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {io, Socket} from 'socket.io-client';
import Pong from './Pong';

function Game() {
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleNotice = (notice: string) => {
    console.log(notice);
  };

  const handleRoomname = ({room_name}: {room_name: string}) => {
    console.log(room_name);
    sessionStorage.setItem('room_name', room_name);
  };

  useEffect(() => {
    const socketIo: Socket = io('http://localhost:3001/game');
    const username = 'user_' + (Math.random() * 1000).toString();
    socketIo.emit('join_game', username);

    socketIo.on('notice', handleNotice);
    socketIo.on('room_name', handleRoomname);
    setSocket(socketIo);
    return () => {
      socketIo.off('notice', handleNotice);
      socketIo.off('room_name', handleRoomname);
    };
  }, []);

  return (
    <>
      <p>game</p>
      <Pong socket={socket} />
    </>
  );
}

export default Game;
