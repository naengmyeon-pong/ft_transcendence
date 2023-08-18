'use client';

import {DmListData, UserType} from '@/types/UserContext';
import React, {createContext, useState, ReactNode, useRef} from 'react';
import {Manager, Socket} from 'socket.io-client';

interface UserContextType {
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

  manager: Manager | null;
  setManager: (manager: Manager) => void;
}

const initUserState: UserContextType = {
  chat_socket: null,
  setChatSocket: () => {},

  user_id: null,
  setUserId: () => {},

  user_image: null,
  setUserImage: () => {},

  user_nickname: null,
  setUserNickName: () => {},

  block_users: new Map(),

  convert_page: 0,
  setConvertPage: () => {},

  manager: null,
  setManager: () => {},
};

const UserContext = createContext(initUserState);

const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [chat_socket, setChatSocket] = useState<Socket | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [user_image, setUserImage] = useState<string | null>(null);
  const [user_nickname, setUserNickName] = useState<string | null>(null);
  const block_users = useRef<Map<string, UserType>>(new Map());
  const [convert_page, setConvertPage] = useState<number>(0);
  const [manager, setManager] = useState<Manager | null>(null);

  return (
    <UserContext.Provider
      value={{
        chat_socket,
        setChatSocket,
        user_id,
        setUserId,
        user_image,
        setUserImage,
        user_nickname,
        setUserNickName,
        block_users: block_users.current,
        convert_page,
        setConvertPage,
        manager,
        setManager,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export {UserContext, UserProvider};
