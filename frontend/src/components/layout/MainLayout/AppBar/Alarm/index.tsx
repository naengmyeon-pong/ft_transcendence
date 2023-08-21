import {MouseEvent, useCallback, useContext, useEffect, useState} from 'react';
import {Badge, IconButton, Menu} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {InviteGameInfo} from '@/common/types/game';
import ChatAlarm from './ChatAlarm';
import GameAlarm from './GameAlarm';
import {Chatnotificate, InviteGameInfoProps} from './AlarmProps';
import {UserContext} from '../../Context';

export default function AlarmEvent() {
  const [read_notificate, setReadNotificate] = useState<boolean>(false);
  // const [game_noti, setGameAlarm] = useState<InviteGameInfo[]>([]);
  const [game_noti, setGameAlarm] = useState<InviteGameInfoProps[]>([]);
  const [chat_noti, setChatAlarm] = useState<Chatnotificate[]>([]);
  const [alram_menu, setAlarmMenu] = useState<null | HTMLElement>(null);
  const {chat_socket} = useContext(UserContext);
  const notificate_open = Boolean(alram_menu);

  function handleNotificate(event: MouseEvent<HTMLElement>) {
    setReadNotificate(false);
    setAlarmMenu(event.currentTarget);
  }

  function handleNotificateMenuClose() {
    setAlarmMenu(null);
  }

  // 초대를 받는 이벤트
  const inviteGameEvent = useCallback(
    (inviteGameInfo: InviteGameInfo) => {
      console.log(inviteGameInfo);
      const tmp: InviteGameInfoProps = {
        invite_game_info: inviteGameInfo,
        event_type: '초대',
      };
      setGameAlarm(prev => [...prev, tmp]);
      setReadNotificate(true);
    },
    [setReadNotificate, setGameAlarm]
  );

  // 초대한 사용자가 응답한 사용자에 대한 결과를 받는 이벤트
  const inviteGameMoveEvent = useCallback(
    (inviteGameInfo: InviteGameInfo | string) => {
      console.log(inviteGameInfo);
      // 거절
      const tmp: InviteGameInfoProps = {
        invite_game_info: inviteGameInfo,
        event_type: '',
      };
      if (typeof inviteGameInfo === 'string') {
        tmp.event_type = '초대_거절';
      } else {
        tmp.event_type = '초대_수락';
      }
      setGameAlarm(prev => [...prev, tmp]);
      setReadNotificate(true);
    },
    [setReadNotificate, setGameAlarm]
  );

  useEffect(() => {
    chat_socket?.on('invite_game', inviteGameEvent);
    chat_socket?.on('invite_response', inviteGameMoveEvent);
    return () => {
      chat_socket?.off('invite_game', inviteGameEvent);
      chat_socket?.off('invite_response', inviteGameMoveEvent);
    };
  }, [chat_socket, inviteGameEvent, inviteGameMoveEvent]);

  const handleChatAlarm = useCallback(
    (rep: Chatnotificate) => {
      console.log(rep);
      setChatAlarm(preNotis => [...preNotis, rep]);
      setReadNotificate(true);
    },
    [setReadNotificate, setChatAlarm]
  );

  useEffect(() => {
    chat_socket?.on('chatroom-notification', handleChatAlarm);
    return () => {
      chat_socket?.off('chatroom-notification', handleChatAlarm);
    };
  }, [chat_socket, setReadNotificate, handleChatAlarm]);

  return (
    <>
      <IconButton
        onClick={handleNotificate}
        aria-label="more"
        id="long-button"
        aria-controls={notificate_open ? 'long-menu' : undefined}
        aria-expanded={notificate_open ? 'true' : undefined}
        aria-haspopup="true"
      >
        {read_notificate ? (
          <Badge
            overlap="circular"
            color="error"
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            variant="dot"
          >
            <NotificationsIcon sx={{color: 'black'}} />
          </Badge>
        ) : (
          <NotificationsIcon sx={{color: 'black'}} />
        )}
      </IconButton>
      {(game_noti.length > 0 || chat_noti.length > 0) && (
        <Menu
          id="long-menu"
          MenuListProps={{
            'aria-labelledby': 'long-button',
          }}
          anchorEl={alram_menu}
          open={notificate_open}
          onClose={handleNotificateMenuClose}
          onClick={handleNotificateMenuClose}
        >
          <ChatAlarm chat_noti={chat_noti} setChatAlarm={setChatAlarm} />
          <GameAlarm game_noti={game_noti} setGameAlarm={setGameAlarm} />
        </Menu>
      )}
    </>
  );
}
