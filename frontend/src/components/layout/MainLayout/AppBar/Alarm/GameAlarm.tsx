import {useCallback, useContext, useEffect} from 'react';
import {AlarmGameProps, InviteGameInfoProps} from './AlarmProps';
import {UserContext} from '../../Context';
import {InviteGameInfo} from '@/common/types/game';
import {useRouter} from 'next/router';
import {Box, Button, Typography} from '@mui/material';

// 초대 상태에 따라 메세지를 나눠주는 컴포넌트
function TitleGameAlarm({row}: {row: InviteGameInfoProps}) {
  return (
    <Typography>
      {row.event_type === '초대' &&
        `${row.invite_game_info.inviter_nickname}님이 게임을 초대하였습니다.`}
      {row.event_type === '초대_수락' &&
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
  const {chat_socket} = useContext(UserContext);
  const router = useRouter();

  function clickTrue(row: InviteGameInfo, index: number) {
    game_noti.splice(index, 1);
    chat_socket?.emit('invite_response', row);
    router.push('/main/game');
  }

  function clickFalse(row: InviteGameInfo, index: number) {
    game_noti.splice(index, 1);
    chat_socket?.emit('invite_response', row.inviter_nickname);
  }

  return (
    <>
      {row.event_type === '초대' && (
        <Box>
          <Button onClick={() => clickTrue(row, index)}>수락</Button>
          <Button onClick={() => clickFalse(row, index)}>거절</Button>
        </Box>
      )}
      {row.event_type === '초대_거절' && (
        <Box>{`${row.invite_game_info}님이 게임초대를 거절하였습니다.`}</Box>
      )}
      {row.event_type === '초대_수락' && (
        <Box>
          <Button>수락</Button>
          <Button>거절</Button>
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
