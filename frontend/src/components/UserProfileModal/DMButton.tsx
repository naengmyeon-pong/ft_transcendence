import {useGlobalModal} from '@/hooks/useGlobalModal';
import {dmUserInfo} from '@/states/dmUser';
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

  const {user_id} = useContext(UserContext);
  function handleClick() {
    if (user_id === null) {
      return;
    }
    setDmChoise(true);

    if (dm_user === null || dm_user.id !== user_info.id) {
      setDmUser(user_info);
    }
    closeGlobalModal();
  }
  return <Button onClick={handleClick}>1:1 대화하기</Button>;
};
