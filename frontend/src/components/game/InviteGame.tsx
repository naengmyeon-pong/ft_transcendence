'use client';

import {GameInfo, InviteGameInfo} from '@/common/types/game';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {UserContext} from '../layout/MainLayout/Context';
import {useRecoilState} from 'recoil';
import {inviteGameState} from '@/states/inviteGame';
import {Button, Grid} from '@mui/material';
import Pong from './Pong';

interface InviteGameViewType {
  isGameOver: boolean;
  gameInfo: GameInfo;
  handleReturnMain: () => void;
}

function InviteGameView({
  isGameOver,
  gameInfo,
  handleReturnMain,
}: InviteGameViewType) {
  const {chat_socket} = useContext(UserContext);

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

export default function InviteGame() {
  const {chat_socket, user_id} = useContext(UserContext);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [invite_game_state, setInviteGameState] =
    useRecoilState(inviteGameState);
  const start_geme_prev_unload = useRef(true);

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

  const exitCancelGame = useCallback(
    (rep: InviteGameInfo) => {
      alert(`${rep} 님이 게임을 취소하였습니다`);
      setInviteGameState(null);
    },
    [setInviteGameState]
  );

  const handleUnload = useCallback(() => {
    chat_socket?.emit('cancel_game', {
      inviteGameInfo: invite_game_state,
      is_inviter: false,
    });
    setInviteGameState(null);
  }, [chat_socket, setInviteGameState, invite_game_state]);

  useEffect(() => {
    sessionStorage.setItem('left_user', invite_game_state.inviter_nickname);
    sessionStorage.setItem('right_user', invite_game_state.invitee_nickname);
    sessionStorage.setItem('room_name', invite_game_state.inviter_id);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('unload', handleUnload);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setInviteGameState(null);
    };
  }, [chat_socket, invite_game_state, setInviteGameState, handleUnload]);

  useEffect(() => {
    // 게임 대기방에 들어왔다는 신호
    chat_socket?.on('enter_game', sendGameStartEvent);
    chat_socket?.on('game_info', handleInviteGameInfo);
    // 초대자가 게임을 거절한 경우
    chat_socket?.on('inviter_cancel_game_refuse', exitCancelGame);
    // 초대자가 초대 후 게임을 시작한경우
    chat_socket?.on('inviter_cancel_game_betray', exitCancelGame);
    // 초대자의 소켓이 끊긴경우
    chat_socket?.on('inviter_cancel_game_refresh', exitCancelGame);

    chat_socket?.on('start_game', () => {
      start_geme_prev_unload.current = false;
      chat_socket?.off('inviter_cancel_game_refuse', exitCancelGame);
      chat_socket?.off('inviter_cancel_game_betray', exitCancelGame);
    });
    chat_socket?.emit('enter_game', invite_game_state);
    return () => {
      chat_socket?.off('inviter_cancel_game_refresh', exitCancelGame);
      chat_socket?.off('enter_game', sendGameStartEvent);
      chat_socket?.off('game_info', handleInviteGameInfo);
      chat_socket?.off('inviter_cancel_game_refuse', exitCancelGame);
      chat_socket?.off('inviter_cancel_game_betray', exitCancelGame);
      chat_socket?.off('start_game');
      if (start_geme_prev_unload.current) {
        chat_socket?.emit('invitee_cancel_game_back', invite_game_state);
      }
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
    <InviteGameView
      isGameOver={isGameOver}
      gameInfo={gameInfo}
      handleReturnMain={handleReturnMain}
    />
  );
}
