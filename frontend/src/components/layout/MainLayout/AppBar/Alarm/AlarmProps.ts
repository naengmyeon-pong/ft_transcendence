import {InviteGameInfo} from '@/common/types/game';

export interface Chatnotificate {
  user_id: string;
  room_id: string;
}

export interface AlarmChatProps {
  chat_noti: Chatnotificate[];
  setChatAlarm: React.Dispatch<React.SetStateAction<Chatnotificate[]>>;
}

export interface InviteGameInfoProps {
  invite_game_info: InviteGameInfo | string;
  event_type: string;
}

export interface AlarmGameProps {
  game_noti: InviteGameInfoProps[];
  setGameAlarm: React.Dispatch<React.SetStateAction<InviteGameInfoProps[]>>;
}

export const InviteGameEnum = {
  INVITE: '초대',
  INVITE_RESPON_TRUE: '초대_수락',
  INVITE_RESPON_FALSE: '초대_거절',
  LEFTWAITINGROOM: '대기방나감',
  INVITER_OFF: 'inviter_off',
  INVITEE_OFF: 'invitee_off',
};
