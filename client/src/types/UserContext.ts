import {Socket} from 'socket.io-client';

export interface UserContextType {
  socket: Socket | null;
  setSocket: (socket: Socket) => void;

  user_id: string | null;
  setUserId: (user_id: string) => void;

  user_image: string | null;
  setUserImage: (user_image: string) => void;

  user_nickname: string | null;
  setUserNickName: (user_nickname: string) => void;

  block_users: Map<string, UserType>;

  convert_page: number;
  setConvertPage: (convert_page: number) => void;

  dm_list: DmListData[];
  setDmList: (dm_list: DmListData[]) => void;
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
  user1: string;
  user2: string;
  nickname: string;
}

export interface DmChat {
  userId: string;
  someoneId: string;
  message: string;
}

export interface Notificate {
  user_id: string;
  room_id: string;
}
