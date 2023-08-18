import {useGlobalModal} from '@/hooks/useGlobalModal';
import {dmList, dmUserInfo} from '@/states/dmUser';
import {profileDMChoise} from '@/states/userContext';
import {useContext} from 'react';
import {useRecoilState} from 'recoil';
import {UserContext} from '../layout/MainLayout/Context';
import {UserType} from '@/types/UserContext';
import {Button} from '@mui/material';

export const HandleAddDmList = ({user_info}: {user_info: UserType}) => {
  const [dm_user, setDmUser] = useRecoilState(dmUserInfo);
  const [, setDmChoise] = useRecoilState(profileDMChoise);
  const {closeGlobalModal} = useGlobalModal();
  const [dm_list, setDmList] = useRecoilState(dmList);

  const {user_id} = useContext(UserContext);
  function handleClick() {
    if (user_id === null) {
      return;
    }
    setDmChoise(true);

    if (dm_user === null || dm_user.id !== user_info.id) {
      setDmUser(user_info);
    }
    console.log(dm_list);
    if (dm_list.some(item => item.user2 === user_info.id)) {
      return;
    }
    setDmList(prev => {
      return [
        ...prev,
        {
          user1: user_id,
          user2: user_info.id,
          nickname: user_info.nickName,
        },
      ];
    });
    closeGlobalModal();
  }
  return <Button onClick={handleClick}>1:1 대화하기</Button>;
};
