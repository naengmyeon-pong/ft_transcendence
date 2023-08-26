import {useRouter} from 'next/router';
import {AlarmChatProps} from '../AlarmProps';
import {useContext} from 'react';
import {UserContext} from '../../../Context';
import {MenuItem, Typography} from '@mui/material';

export interface Chatnotificate {
  user_nickname: string;
  room_id: string;
}

export default function ChatAlarm({chat_noti, setChatAlarm}: AlarmChatProps) {
  const {setConvertPage} = useContext(UserContext);
  const router = useRouter();

  function handleSendRoom(row: Chatnotificate, index: number) {
    setChatAlarm(prev => {
      prev.splice(index, 1);
      return prev;
    });
    setConvertPage(Number(row.room_id));
    router.push('/main/chat');
  }
  return (
    <>
      {chat_noti.length > 0 && (
        <>
          {chat_noti.map((row, index) => (
            <MenuItem key={index} onClick={() => handleSendRoom(row, index)}>
              <Typography>
                {`${row.user_nickname}님이 채팅방으로 초대하였습니다`}
              </Typography>
            </MenuItem>
          ))}
        </>
      )}
    </>
  );
}
