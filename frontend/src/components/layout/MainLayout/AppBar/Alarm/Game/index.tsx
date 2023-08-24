import {AlarmGameProps} from '../AlarmProps';
import {Box} from '@mui/material';
import ActionGameAlarm from './Action';
import TitleGameAlarm from './Title';

export default function GameAlarm({game_noti, setGameAlarm}: AlarmGameProps) {
  return (
    <>
      {game_noti.length > 0 && (
        <>
          {game_noti.map((row, index) => (
            <Box key={index}>
              <TitleGameAlarm row={row} />
              <ActionGameAlarm
                row={row}
                index={index}
                setGameAlarm={setGameAlarm}
              />
            </Box>
          ))}
        </>
      )}
    </>
  );
}
