'use client';

import {GameInfo} from '@/common/types/game';
import {useCallback, useContext, useEffect, useState} from 'react';
import {UserContext} from '../layout/MainLayout/Context';
import {useRecoilState} from 'recoil';
import {inviteGameState} from '@/states/inviteGame';
import {Button, Grid} from '@mui/material';
import Pong from './Pong';

export default function InviteGame() {
  const {chat_socket, user_id} = useContext(UserContext);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [invite_game_state, setInviteGameState] =
    useRecoilState(inviteGameState);

  const handleReturnMain = () => {
    setIsGameOver(false);
    setGameInfo(null);
  };

  const handleGameInfo = useCallback(({game_info}: {game_info: GameInfo}) => {
    if (game_info === null) {
      return;
    }
    setGameInfo(game_info);
    if (game_info.leftScore === 5 || game_info.rightScore === 5) {
      setIsGameOver(true);
    }
  }, []);

  useEffect(() => {
    chat_socket?.emit('enter_game', {
      user_id: user_id,
      room_name: invite_game_state.inviter_id,
    });
    if (invite_game_state.inviter_id === user_id) {
      chat_socket?.emit('update_frame', invite_game_state.inviter_id);
    }
    // 게임방에 대한 정보를 받아오는 이벤트(유저의 닉네임 등)
    // chat_socket?.on('room_name', handleRoomname);
    // 게임에 대한 업데이트를 받아오는 이벤트
    chat_socket?.on('game_info', handleGameInfo);
    return () => {};
  }, [chat_socket, user_id, invite_game_state.inviter_id, handleGameInfo]);

  return (
    <>
      {!isGameOver && (
        <Grid item xs={8}>
          <Pong socket={chat_socket} gameInfo={gameInfo} />
        </Grid>
      )}
      {isGameOver && gameInfo !== null && (
        <Grid item>
          <p>
            {gameInfo.leftScore > gameInfo.rightScore
              ? sessionStorage.getItem('left_user')
              : sessionStorage.getItem('right_user')}
            승리!
          </p>
          <Button variant="contained" onClick={handleReturnMain}>
            메인으로 돌아가기
          </Button>
        </Grid>
      )}
    </>
  );
}
