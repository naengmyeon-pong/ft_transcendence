enum PermissionType {
  User = 0,
  Admin,
  Owner,
}
interface UserType {
  nickName: string;
  intraId: string;
  userImage: string;
}

interface UserProps {
  // key: number;
  user: UserType;
  // permission: number;
}

interface ChatListData {
  is_password: boolean;
  max_num: string;
  current_num: string;
  name: string;
  owner: string;
}

interface ComponentProps {
  roomList: ChatListData[];
}
