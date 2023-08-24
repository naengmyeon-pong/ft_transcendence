'use client';

import {useEffect, useContext} from 'react';
import {useRecoilValue} from 'recoil';

import {inviteGameState} from '@/states/inviteGame';
import Game from '@/components/game/Game';
import InviteGame from '@/components/game/InviteGame';
import {UserContext} from '@/components/layout/MainLayout/Context';

function GameManager() {
  const invite_game_state = useRecoilValue(inviteGameState);
  const {chat_socket} = useContext(UserContext);
  
  useEffect(() => {
    return () => {
      if (chat_socket) {
        chat_socket.emit('exit_game');
      }
    }
  }, []);

  return <>{invite_game_state === null ? <Game /> : <InviteGame />}</>;
}

export default GameManager;
