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

interface Velocity {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

interface Ball {
  pos: Coordinate;
  vel: Velocity;
}

interface GameInfo {
  leftPaddle: Coordinate;
  leftScore: number;
  rightPaddle: Coordinate;
  rightScore: number;
  ball: Ball;
}

function Game() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

  const handleNotice = (notice: string) => {
    console.log(notice);
  };

  const handleRoomname = ({room_name}: {room_name: string}) => {
    console.log(room_name);
    sessionStorage.setItem('room_name', room_name);
  };

  const handleGameInfo = ({game_info}: {game_info: GameInfo}) => {
    // console.log(game_info);
    setGameInfo(game_info);
  };

  useEffect(() => {
    const socketIo: Socket = io('http://localhost:3001/game');
    const username = 'user_' + (Math.random() * 1000).toString();
    socketIo.emit('join_game', username);

    socketIo.on('notice', handleNotice);
    socketIo.on('room_name', handleRoomname);
    socketIo.on('game_info', handleGameInfo);
    setSocket(socketIo);
    return () => {
      socketIo.off('notice', handleNotice);
      socketIo.off('room_name', handleRoomname);
      socketIo.off('game_info', handleGameInfo);
    };
  }, []);

  return (
    <>
      <p>game</p>
      <Pong socket={socket} gameInfo={gameInfo} />
    </>
  );
}

export default Game;
