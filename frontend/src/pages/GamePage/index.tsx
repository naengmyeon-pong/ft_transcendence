import React, {useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {Box, Grid} from '@mui/material';
import Pong from './Pong';

import {GameInfo, RoomUserInfo, JoinGameInfo} from '@/types/game';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

// const socket: Socket = io('http://localhost:3001/game');

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = '';
};

function Game() {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const handleNotice = (notice: string) => {
    console.log(notice);
  };

  const handleRoomname = (roomUserInfo: RoomUserInfo) => {
    const {
      room_name,
      left_user,
      right_user,
    }: {room_name: string; left_user: string; right_user: string} =
      roomUserInfo;

    sessionStorage.setItem('room_name', room_name);
    sessionStorage.setItem('left_user', left_user);
    sessionStorage.setItem('right_user', right_user);

    // if (socket) {
    //   socket.emit('update_frame', room_name);
    // }
  };

  const handleGameInfo = ({game_info}: {game_info: GameInfo}) => {
    setGameInfo(game_info);
  };

  useEffect(() => {
    const username = 'user_' + (Math.random() * 1000).toString();
    const joinGameInfo: JoinGameInfo = {
      user_id: username,
      mode: 'easy',
      type: 'normal',
    };
    // socket.emit('join_game', joinGameInfo);

    // socket.on('notice', handleNotice);
    // socket.on('room_name', handleRoomname);
    // socket.on('game_info', handleGameInfo);
    window.addEventListener('beforeunload', handleBeforeUnload);

    sessionStorage.removeItem('room_name');
    sessionStorage.removeItem('left_user');
    sessionStorage.removeItem('right_user');

    return () => {
      // socket.off('notice', handleNotice);
      // socket.off('room_name', handleRoomname);
      // socket.off('game_info', handleGameInfo);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <Grid id="game-area" container justifyContent="center" xs={12}>
        <Grid id="mode-selection" container justifyContent="center" xs={12}>
          <Grid xs={6}>
            <p>123</p>
          </Grid>
          <Grid xs={6}>
            <p>123</p>
          </Grid>
        </Grid>
        <Grid xs={8}>
          <Pong gameInfo={gameInfo} />
        </Grid>
      </Grid>
    </>
  );
}

export default Game;
