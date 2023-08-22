'use client';

import {GameInfo, RoomUserInfo} from '@/common/types/game';
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

  const handleInviteGameInfo = useCallback(
    ({game_info}: {game_info: GameInfo}) => {
      if (game_info === null) {
        return;
      }
      setGameInfo(game_info);
      if (game_info.leftScore === 5 || game_info.rightScore === 5) {
        setIsGameOver(true);
      }
    },
    []
  );

  const handleInviteRoomName = useCallback((roomUserInfo: RoomUserInfo) => {
    const {
      room_name,
      left_user,
      right_user,
    }: {room_name: string; left_user: string; right_user: string} =
      roomUserInfo;

    sessionStorage.setItem('room_name', room_name);
    sessionStorage.setItem('left_user', left_user);
    sessionStorage.setItem('right_user', right_user);
  }, []);

  const sendGameStartEvent = useCallback(() => {
    console.log('시작이벤트 받음');
    chat_socket?.emit('update_frame', invite_game_state.inviter_id);
  }, [chat_socket, invite_game_state.inviter_id]);

  useEffect(() => {
    chat_socket?.on('enter_game', sendGameStartEvent);
    chat_socket?.on('game_info', handleInviteGameInfo);
    chat_socket?.on('room_name', handleInviteRoomName);
    chat_socket?.emit('enter_game', invite_game_state);
    return () => {
      chat_socket?.off('enter_game', sendGameStartEvent);
      chat_socket?.off('game_info', handleInviteGameInfo);
      chat_socket?.off('enter_game', sendGameStartEvent);
    };
  }, [
    chat_socket,
    user_id,
    invite_game_state.inviter_id,
    handleInviteRoomName,
    handleInviteGameInfo,
    sendGameStartEvent,
    invite_game_state,
  ]);

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
