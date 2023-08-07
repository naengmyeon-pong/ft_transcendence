enum PermissionType {
  User = 0,
  Admin,
  Owner,
}
interface UserType {
  nickName: string;
  id: string;
  image: string;
}

interface UserProps {
  user: UserType;
  permission: string;
  myPermission: string;
}

interface ChatListData {
  id: number;
  name: string;
  current_nums: number;
  max_nums: number;
  is_public: boolean;
  is_password: boolean;
  current_num: string;
  owner: string;
}

interface ComponentProps {
  roomList: ChatListData[];
  refersh: () => Promise<void>;
}

interface DmListData {
  user1: string;
  user2: string;
  nickname: string;
}

interface DmChat {
  userId: string;
  someoneId: string;
  message: string;
}
