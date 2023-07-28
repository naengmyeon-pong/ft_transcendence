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

const socket = io('http://localhost:3001/game');

function Game() {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const handleNotice = (notice: string) => {
    console.log(notice);
  };

  const handleRoomname = ({room_name}: {room_name: string}) => {
    sessionStorage.setItem('room_name', room_name);

    if (socket) {
      socket.emit('update_frame', room_name);
    }
  };

  const handleGameInfo = ({game_info}: {game_info: GameInfo}) => {
    setGameInfo(game_info);
  };

  useEffect(() => {
    const username = 'user_' + (Math.random() * 1000).toString();
    socket.emit('join_game', username);

    socket.on('notice', handleNotice);
    socket.on('room_name', handleRoomname);
    socket.on('game_info', handleGameInfo);
    return () => {
      socket.off('notice', handleNotice);
      socket.off('room_name', handleRoomname);
      socket.off('game_info', handleGameInfo);
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
