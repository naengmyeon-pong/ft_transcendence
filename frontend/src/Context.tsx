// SocketContext.tsx

import React, {createContext, useState, useContext, ReactNode} from 'react';
import {Socket} from 'socket.io-client';

interface UserContextType {
  socket: Socket | null;
  user_id: string | null;
  user_image: string | null;
  user_nickname: string | null;
  setSocket: (socket: Socket) => void;
  setUserId: (user_id: string) => void;
  setUserImage: (user_id: string) => void;
  setUserNickName: (user_id: string) => void;
}

const initialUserState: UserContextType = {
  socket: null,
  user_id: null,
  user_image: null,
  user_nickname: null,
  setSocket: () => {},
  setUserId: () => {},
  setUserImage: () => {},
  setUserNickName: () => {},
};

const UserContext = createContext(initialUserState);

const UserProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [user_image, setUserImage] = useState<string | null>(null);
  const [user_nickname, setUserNickName] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{
        socket,
        user_id,
        user_image,
        user_nickname,
        setSocket,
        setUserId,
        setUserImage,
        setUserNickName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export {UserContext, UserProvider};
