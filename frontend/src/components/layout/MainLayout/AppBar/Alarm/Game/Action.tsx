import {useRouter} from 'next/router';
import {useContext} from 'react';

import {useRecoilState} from 'recoil';

import {Box, Button, Typography} from '@mui/material';

import {InviteGameEnum, InviteGameInfoProps} from '../AlarmProps';
import {UserContext} from '../../../Context';
import {inviteGameState} from '@/states/inviteGame';

export default function ActionGameAlarm({
  row,
  index,
  setGameAlarm,
}: {
  row: InviteGameInfoProps;
  index: number;
  setGameAlarm: React.Dispatch<React.SetStateAction<InviteGameInfoProps[]>>;
}) {
  const {chat_socket} = useContext(UserContext);
  const router = useRouter();
  const [invite_game_state, setInviteGameState] =
    useRecoilState(inviteGameState);

  function removeGameNoti() {
    setGameAlarm(prev => {
      prev.splice(index, 1);
      return prev;
    });
  }

  // B가 누르는 수락
  function inviteTrue() {
    removeGameNoti();
    if (
      typeof row.invite_game_info === 'object' &&
      row.invite_game_info !== null
    ) {
      row.invite_game_info.state = true;
      chat_socket?.emit('invite_response', row.invite_game_info);
      setInviteGameState(row.invite_game_info);
      router.push('/main/game');
    }
  }

  // B가 누르는 거절
  function inViteFalse() {
    removeGameNoti();
    if (
      typeof row.invite_game_info === 'object' &&
      row.invite_game_info !== null
    ) {
      row.invite_game_info.state = false;
      chat_socket?.emit('invite_response', row.invite_game_info);
    }
  }

  // A가 최종적으로 누르는 수락
  function inviteResponTrue() {
    if (
      typeof row.invite_game_info === 'object' &&
      row.invite_game_info !== null
    ) {
      row.invite_game_info.state = true;
      removeGameNoti();
      setInviteGameState(row.invite_game_info);
      router.push('/main/game');
    }
  }

  // A가 최종적으로 누르는 거절
  function inviteResponFalse() {
    removeGameNoti();
    if (
      typeof row.invite_game_info === 'object' &&
      row.invite_game_info !== null
    ) {
      console.log('거절클릭: ');
      chat_socket?.emit('cancel_game', {
        inviteGameInfo: invite_game_state,
        is_inviter: true,
      });
    }
  }

  function cancelGame() {
    removeGameNoti();
  }

  return (
    <>
      {row.event_type === InviteGameEnum.INVITE && (
        <Box>
          <Button onClick={inviteTrue}>수락</Button>
          <Button onClick={inViteFalse}>거절</Button>
        </Box>
      )}
      {row.event_type === InviteGameEnum.INVITE_RESPON_FALSE &&
        typeof row.invite_game_info !== 'string' && (
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
      {(row.event_type === InviteGameEnum.INVITER_OFF ||
        row.event_type === InviteGameEnum.INVITEE_OFF) &&
        typeof row.invite_game_info === 'string' && (
          <Typography onClick={cancelGame}>
            {row.invite_game_info} 님이 게임을 취소하였습니다
          </Typography>
        )}
    </>
  );
}
