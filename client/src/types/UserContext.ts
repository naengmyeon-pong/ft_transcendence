import {Socket} from 'socket.io-client';

export interface UserContextType {
  chat_socket: Socket | null;
  setChatSocket: (chat_socket: Socket) => void;

  user_id: string | null;
  setUserId: (user_id: string) => void;

  user_image: string | null;
  setUserImage: (user_image: string) => void;

  user_nickname: string | null;
  setUserNickName: (user_nickname: string) => void;

  block_users: Map<string, UserType>;

  convert_page: number;
  setConvertPage: (convert_page: number) => void;
}

export enum PermissionType {
  User = 0,
  Admin,
  Owner,
}
export interface UserType {
  nickName: string;
  id: string;
  image: string;
}

export interface UserProps {
  user: UserType;
  permission: string;
  myPermission: string;
}

export interface ChatListData {
  id: number;
  name: string;
  current_nums: number;
  max_nums: number;
  is_public: boolean;
  is_password: boolean;
  current_num: string;
  owner: string;
}

export interface RoomListProps {
  roomList: ChatListData[];
  refersh: () => Promise<void>;
}

export interface DmListData {
  // 받는이
  user1: string;
  // 보낸이
  user2: string;
  // 보낸이 닉네임
  nickname: string;
}

export interface DmChat {
  // 보낸이
  userId: string;
  // 받는이
  someoneId: string;
  message: string;
  // 보낸이
  nickname: string;
}

export interface Notificate {
  user_id: string;
  room_id: string;
}
