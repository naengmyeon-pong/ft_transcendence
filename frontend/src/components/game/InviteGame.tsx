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
    setInviteGameState(null);
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

  const sendGameStartEvent = useCallback(() => {
    chat_socket?.emit('update_frame', invite_game_state.inviter_id);
  }, [chat_socket, invite_game_state.inviter_id]);

  // TODO: 게임 대기방에서 초대를 수락하는 경우 생각해볼것
  const exitCancelGame = useCallback(
    (rep: string) => {
      alert(`${rep} 님이 게임을 취소하였습니다`);
      setInviteGameState(null);
    },
    [setInviteGameState]
  );

  useEffect(() => {
    sessionStorage.setItem('left_user', invite_game_state.inviter_nickname);
    sessionStorage.setItem('right_user', invite_game_state.invitee_nickname);
    sessionStorage.setItem('room_name', invite_game_state.inviter_id);
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    function handleUnload() {
      chat_socket?.emit('cancel_game', {
        inviteGameInfo: invite_game_state,
        is_inviter: false,
      });
    }

    window.addEventListener('unload', handleUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.addEventListener('unload', handleUnload);
      window.addEventListener('beforeunload', handleBeforeUnload);
    };
  }, [chat_socket, invite_game_state]);

  useEffect(() => {
    chat_socket?.on('enter_game', sendGameStartEvent);
    chat_socket?.on('game_info', handleInviteGameInfo);
    chat_socket?.on('cancel_game', exitCancelGame);
    chat_socket?.on('start_game', () => {
      chat_socket?.off('cancel_game', exitCancelGame);
    });
    chat_socket?.emit('enter_game', invite_game_state);
    return () => {
      chat_socket?.off('enter_game', sendGameStartEvent);
      chat_socket?.off('game_info', handleInviteGameInfo);
      chat_socket?.off('cancel_game', exitCancelGame);
    };
  }, [
    chat_socket,
    user_id,
    invite_game_state.inviter_id,
    handleInviteGameInfo,
    sendGameStartEvent,
    invite_game_state,
    exitCancelGame,
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
