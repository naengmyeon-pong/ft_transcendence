'use client';

import {useRecoilValue} from 'recoil';

import {inviteGameState} from '@/states/inviteGame';
import Game from '@/components/game/Game';
import InviteGame from '@/components/game/InviteGame';

function GameManager() {
  const invite_game_state = useRecoilValue(inviteGameState);

  return <>{invite_game_state === null ? <Game /> : <InviteGame />}</>;
}

export default GameManager;
