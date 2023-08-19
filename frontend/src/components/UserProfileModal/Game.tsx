import {useGlobalModal} from '@/hooks/useGlobalModal';
import {inviteGameState, inviteGameStateBool} from '@/states/inviteGame';
import {UserType} from '@/types/UserContext';
import {Button, FormControlLabel, Radio, RadioGroup} from '@mui/material';
import {useRouter} from 'next/router';
import {useContext, useEffect} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {UserContext} from '../layout/MainLayout/Context';

function Action({user_info}: {user_info: UserType}) {
  const {closeGlobalModal} = useGlobalModal();
  const mode = useRecoilValue(inviteGameState); //에러
  const router = useRouter();
  const {chat_socket, user_id} = useContext(UserContext);
  const setState = useSetRecoilState(inviteGameStateBool);

  const inviteGame = () => {
    console.log('초대');
    console.log(mode);
    setState(true);
    chat_socket?.emit(
      'invite_game',
      {
        inviter_id: user_id,
        invitee_id: user_info.id,
        mode: mode,
      },
      (rep: boolean) => {
        console.log(rep);
        if (rep === false) {
          alert('접속중인 유저가 아닙니다');
          setState(false);
        }
      }
    );
    closeGlobalModal();
    router.push('/main/game');
  };

  return (
    <>
      <Button onClick={inviteGame}>초대</Button>
      <Button onClick={closeGlobalModal}>닫기</Button>
    </>
  );
}

function Content() {
  const [mode, setMode] = useRecoilState(inviteGameState); // 에러 없음
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
