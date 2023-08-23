import {useCallback, useContext, useEffect} from 'react';
import {
  AlarmGameProps,
  InviteGameEnum,
  InviteGameInfoProps,
} from './AlarmProps';
import {UserContext} from '../../Context';
import {useRouter} from 'next/router';
import {Box, Button, Typography} from '@mui/material';
import {useSetRecoilState} from 'recoil';
import {InviteGameUserType, inviteGameState} from '@/states/inviteGame';

// 초대 상태에 따라 메세지를 나눠주는 컴포넌트

function TitleGameAlarm({row}: {row: InviteGameInfoProps}) {
  return (
    <Typography>
      {row.event_type === InviteGameEnum.INVITE &&
        `${row.invite_game_info.inviter_nickname}님이 게임을 초대하였습니다.`}
      {row.event_type === InviteGameEnum.INVITE_RESPON_TRUE &&
        `${row.invite_game_info}님이 게임초대를 수락하였습니다. 이동하시겠습니까?`}
    </Typography>
  );
}

function ActionGameAlarm({
  row,
  index,
  game_noti,
  setGameAlarm,
}: {
  row: InviteGameInfoProps;
  index: number;
  game_noti: InviteGameInfoProps[];
  setGameAlarm: React.Dispatch<React.SetStateAction<InviteGameInfoProps[]>>;
}) {
  const {chat_socket, user_nickname} = useContext(UserContext);
  const router = useRouter();
  const setInviteGameState = useSetRecoilState(inviteGameState);

  function removeGameNoti() {
    game_noti.splice(index, 1);
  }

  // B가 누르는 수락
  function inviteTrue() {
    removeGameNoti();
    chat_socket?.emit('invite_response', row);
    setInviteGameState(row.invite_game_info);
    // room_id 저장
    router.push('/main/game');
  }

  // B가 누르는 거절
  function inViteFalse() {
    removeGameNoti();
    chat_socket?.emit('invite_response', user_nickname);
  }

  // A가 최종적으로 누르는 수락
  function inviteResponTrue() {
    setInviteGameState(row.invite_game_info);
    router.push('/main/game');
  }

  // A가 최종적으로 누르는 거절
  function inviteResponFalse() {
    chat_socket?.emit('cancel_game', {is_inviter: true});
  }

  return (
    <>
      {row.event_type === InviteGameEnum.INVITE && (
        <Box>
          <Button onClick={inviteTrue}>수락</Button>
          <Button onClick={inViteFalse}>거절</Button>
        </Box>
      )}
      {row.event_type === InviteGameEnum.INVITE_RESPON_FALSE && (
        <Box
          onClick={removeGameNoti}
        >{`${row.invite_game_info.inviter_nickname}님이 게임초대를 거절하였습니다.`}</Box>
      )}
      {row.event_type === InviteGameEnum.INVITE_RESPON_TRUE && (
        <Box>
          <Button onClick={inviteResponTrue}>수락</Button>
          <Button onClick={inviteResponFalse}>거절</Button>
        </Box>
      )}
    </>
  );
}

export default function GameAlarm({game_noti, setGameAlarm}: AlarmGameProps) {
  return (
    <>
      {game_noti.length > 0 && (
        <>
          {game_noti.map((row, index) => (
            //  onClick={() => handleSendGame(row, index)}
            <Box key={index}>
              <TitleGameAlarm row={row} />
              <ActionGameAlarm
                row={row}
                index={index}
                game_noti={game_noti}
                setGameAlarm={setGameAlarm}
              />
            </Box>
          ))}
        </>
      )}
    </>
  );
}
