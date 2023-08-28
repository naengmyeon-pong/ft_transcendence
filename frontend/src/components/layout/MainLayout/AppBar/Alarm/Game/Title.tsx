import {Typography} from '@mui/material';
import {InviteGameEnum, InviteGameInfoProps} from '../AlarmProps';

export default function TitleGameAlarm({row}: {row: InviteGameInfoProps}) {
  return (
    <>
      {typeof row.invite_game_info !== 'string' && (
        <Typography>
          {row.event_type === InviteGameEnum.INVITE &&
            `${row.invite_game_info.inviter_nickname}님이 게임을 초대하였습니다.`}
          {row.event_type === InviteGameEnum.INVITE_RESPON_TRUE &&
            `${row.invite_game_info.invitee_nickname}님이 게임초대를 수락하였습니다. 이동하시겠습니까?`}
          {row.event_type === InviteGameEnum.LEFTWAITINGROOM &&
            `${row.invite_game_info}님이 대기방을 벗어났습니다`}
          {(row.event_type === InviteGameEnum.INVITER_OFF ||
            row.event_type === InviteGameEnum.INVITEE_OFF) &&
            `${row.invite_game_info}님이 게임을 취소하였습니다`}
        </Typography>
      )}
    </>
  );
}
