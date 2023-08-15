'use client';

import {
  convertPageState,
  dmListState,
  socketState,
  userIdState,
  userImageState,
  userNicknameState,
} from '@/states/userContext';
import {UserType} from '@/types/UserContext';
import {useRef} from 'react';
import {useRecoilState} from 'recoil';

export default function useUserContext() {
  const [user_id, setUserId] = useRecoilState(userIdState);
  const [socket, setSocket] = useRecoilState(socketState);
  const [user_image, setUserImage] = useRecoilState(userImageState);
  const [user_nickname, setUserNickName] = useRecoilState(userNicknameState);
  const block_users = useRef(new Map<string, UserType>());
  const [convert_page, setConvertPage] = useRecoilState(convertPageState);
  const [dm_list, setDmList] = useRecoilState(dmListState);

  return {
    user_id,
    setUserId,
    socket,
    setSocket,
    user_image,
    setUserImage,
    user_nickname,
    setUserNickName,
    block_users,
    convert_page,
    setConvertPage,
    dm_list,
    setDmList,
  };
}
