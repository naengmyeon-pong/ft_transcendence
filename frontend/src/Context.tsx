// SocketContext.tsx

import React, {createContext, useState, ReactNode, useRef} from 'react';
import {Socket} from 'socket.io-client';

interface UserContextType {
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

const initUserState: UserContextType = {
  socket: null,
  setSocket: () => {},

  user_id: null,
  setUserId: () => {},

  user_image: null,
  setUserImage: () => {},

  user_nickname: null,
  setUserNickName: () => {},

  block_users: new Map(),

  convert_page: 0,
  setConvertPage: () => {},

  dm_list: [],
  setDmList: () => {},
};

const UserContext = createContext(initUserState);

const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [user_image, setUserImage] = useState<string | null>(null);
  const [user_nickname, setUserNickName] = useState<string | null>(null);
  const block_users = useRef<Map<string>>(new Set());
  const [convert_page, setConvertPage] = useState<number>(0);
  const [dm_list, setDmList] = useState<DmListData[]>([]);

  return (
    <UserContext.Provider
      value={{
        socket,
        setSocket,
        user_id,
        setUserId,
        user_image,
        setUserImage,
        user_nickname,
        setUserNickName,
        block_users: block_users.current,
        convert_page,
        setConvertPage,
        dm_list,
        setDmList,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export {UserContext, UserProvider};
