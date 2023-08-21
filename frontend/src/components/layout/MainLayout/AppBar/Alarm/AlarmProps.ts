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
