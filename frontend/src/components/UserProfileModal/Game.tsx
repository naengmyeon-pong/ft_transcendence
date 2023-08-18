import {useGlobalModal} from '@/hooks/useGlobalModal';
import {CheckBox} from '@mui/icons-material';
import {Button} from '@mui/material';
import {useRouter} from 'next/router';
import {useRecoilState} from 'recoil';

function Action() {
  const {closeGlobalModal} = useGlobalModal();
  return <Button onClick={closeGlobalModal}>닫기</Button>;
}

function Content() {
  return <CheckBox />;
}

function ProfileGame() {
  const router = useRouter();
  const {openGlobalModal} = useGlobalModal();

  function handleClick() {
    openGlobalModal({
      title: '1:1 게임하기',
      content: <Content />,
      action: <Action />,
    });
  }

  return <Button onClick={handleClick}>1:1 게임하기</Button>;
}

export default ProfileGame;
