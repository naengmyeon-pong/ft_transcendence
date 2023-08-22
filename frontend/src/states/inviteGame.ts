import {atom} from 'recoil';
import {InviteGameInfo} from '@/common/types/game';

export const inviteGameModeState = atom<string>({
  key: 'inviteGameModeState',
  default: 'easy',
});

export const InviteGameUserType = {
  NOT_INVITE: 0,
  INVITEE: 1,
  INVITER: 2,
};

export const inviteGameState = atom<InviteGameInfo | null>({
  key: 'inviteGameState',
  default: null,
});
