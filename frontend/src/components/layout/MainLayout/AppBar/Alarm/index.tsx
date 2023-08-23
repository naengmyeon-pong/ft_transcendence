import {MouseEvent, useCallback, useContext, useEffect, useState} from 'react';
import {Badge, IconButton, Menu} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {InviteGameInfo} from '@/common/types/game';
import ChatAlarm from './ChatAlarm';
import GameAlarm from './GameAlarm';
import {
  Chatnotificate,
  InviteGameEnum,
  InviteGameInfoProps,
} from './AlarmProps';
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
        event_type: InviteGameEnum.INVITE,
      };
      setGameAlarm(prev => [...prev, tmp]);
      setReadNotificate(true);
    },
    [setReadNotificate, setGameAlarm]
  );

  // 초대한 사용자가 응답한 사용자에 대한 결과를 받는 이벤트
  const inviteGameMoveEvent = useCallback(
    (inviteGameInfo: InviteGameInfo) => {
      console.log(inviteGameInfo);
      // 거절
      const tmp: InviteGameInfoProps = {
        invite_game_info: inviteGameInfo,
        event_type: '',
      };
      if (inviteGameInfo.state === false) {
        tmp.event_type = InviteGameEnum.INVITE_RESPON_FALSE;
      } else if (inviteGameInfo.state === true) {
        tmp.event_type = InviteGameEnum.INVITE_RESPON_TRUE;
      }
      setGameAlarm(prev => [...prev, tmp]);
      setReadNotificate(true);
    },
    [setReadNotificate, setGameAlarm]
  );

  const cancelGameAlarm = useCallback((rep: InviteGameInfo) => {
    // 이전 알람에서 제거하고 거절했다는 메세지 추가
    setGameAlarm(prev => {
      // 몇 번째의 prev안에 invite_game_info인지 체크해야함
      const foundIndex = prev.findIndex(
        item => item.invite_game_info.invitee_id === rep.invitee_id
      );
      console.log('foundIndex: ', foundIndex);

      if (foundIndex === -1) {
        return prev;
      }

      const updatedNode = {...prev[foundIndex]};
      updatedNode.event_type = InviteGameEnum.INVITE_RESPON_FALSE;

      const updatedAlarmList = [
        ...prev.slice(0, foundIndex),
        updatedNode,
        ...prev.slice(foundIndex + 1),
      ];
      return updatedAlarmList;
    });
  }, []);

  useEffect(() => {
    chat_socket?.on('invite_game', inviteGameEvent);
    chat_socket?.on('invite_response', inviteGameMoveEvent);
    chat_socket?.on('cancel_game_alarm', cancelGameAlarm);
    return () => {
      chat_socket?.off('invite_game', inviteGameEvent);
      chat_socket?.off('invite_response', inviteGameMoveEvent);
      chat_socket?.off('cancel_game_alarm', cancelGameAlarm);
    };
  }, [chat_socket, inviteGameEvent, inviteGameMoveEvent, cancelGameAlarm]);

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
