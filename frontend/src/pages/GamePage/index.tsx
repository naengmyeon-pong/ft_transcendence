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

  const handleNotice = (obj: any) => {
    console.log(obj);
  };

  useEffect(() => {
    const socketIo = io('http://localhost:3001/game');
    const username = 'user_' + (Math.random() * 1000).toString();
    socketIo.emit('join_game', username);

    socketIo.on('notice', handleNotice);
    setSocket(socketIo);
    return () => {
      socketIo.off('notice', handleNotice);
    };
  }, []);
  return (
    <>
      <p>game</p>
      <Pong />
    </>
  );
}

export default Game;
