import {useGlobalModal} from '@/hooks/useGlobalModal';
import {inviteGameModeState} from '@/states/inviteGame';
import {UserType} from '@/types/UserContext';
import {Button, FormControlLabel, Radio, RadioGroup} from '@mui/material';
import {useRouter} from 'next/router';
import {useContext, useEffect} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {UserContext} from '../layout/MainLayout/Context';

function Action({user_info}: {user_info: UserType}) {
  const {closeGlobalModal} = useGlobalModal();
  const mode = useRecoilValue(inviteGameModeState);
  const router = useRouter();
  const {chat_socket, user_id, user_nickname} = useContext(UserContext);

  const inviteGame = () => {
    chat_socket?.emit(
      'invite_game',
      {
        inviter_id: user_id,
        inviter_nickname: user_nickname,
        invitee_id: user_info.id,
        invitee_nickname: user_info.nickName,
        mode: mode,
      },
      (rep: Promise<string | null>) => {
        console.log(rep);
        if (rep !== null) {
          alert(rep);
        }
      }
    );
    closeGlobalModal();
  };

  return (
    <>
      <Button onClick={inviteGame}>초대</Button>
      <Button onClick={closeGlobalModal}>닫기</Button>
    </>
  );
}

function Content() {
  const [mode, setMode] = useRecoilState(inviteGameModeState);
  const handleGameMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.currentTarget.value);
  };

  return (
    <RadioGroup
      aria-labelledby="game-type-selection"
      name="radio-buttons-group"
      value={mode}
      onChange={handleGameMode}
    >
      <FormControlLabel value="easy" control={<Radio />} label="일반 모드" />
      <FormControlLabel value="hard" control={<Radio />} label="가속 모드" />
    </RadioGroup>
  );
}

function ProfileGame({user_info}: {user_info: UserType}) {
  const {openGlobalModal} = useGlobalModal();

  function handleClick() {
    openGlobalModal({
      title: '1:1 게임하기',
      content: <Content />,
      action: <Action user_info={user_info} />,
    });
  }

  return <Button onClick={handleClick}>1:1 게임하기</Button>;
}

export default ProfileGame;
