'use client';

import {inviteGameState} from '@/states/inviteGame';
import Game from '@/components/game/Game';
import InviteGame from '@/components/game/InviteGame';
import {useRecoilValue} from 'recoil';

function GameManager() {
  const invite_game_state = useRecoilValue(inviteGameState);

  return <>{invite_game_state === null ? <Game /> : <InviteGame />}</>;
}

export default GameManager;
