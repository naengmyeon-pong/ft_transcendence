import {atom} from 'recoil';

export const inviteGameState = atom<string>({
  key: 'inviteGameState',
  default: 'easy',
});

export const inviteGameStateBool = atom<boolean>({
  key: 'inviteGameStateBool',
  default: false,
});
