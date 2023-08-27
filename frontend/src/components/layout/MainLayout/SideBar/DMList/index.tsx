import DMUser from './DMUser';
import DMList from './DMList';
import {useRecoilValue} from 'recoil';
import {dmUserInfo} from '@/states/dmUser';

export default function DM() {
  const dm_user = useRecoilValue(dmUserInfo);

  return <>{dm_user === null ? <DMList /> : <DMUser />}</>;
}
