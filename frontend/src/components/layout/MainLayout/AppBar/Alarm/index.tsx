import {MouseEvent, useCallback, useContext, useEffect, useState} from 'react';
import {Badge, IconButton, Menu} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {InviteGameInfo} from '@/common/types/game';
import ChatAlarm from './Chat';
import GameAlarm from './Game';
import {
  Chatnotificate,
  InviteGameEnum,
  InviteGameInfoProps,
} from './AlarmProps';
import {UserContext} from '../../Context';

export default function AlarmEvent() {
  const [read_notificate, setReadNotificate] = useState<boolean>(false);
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

  // 이전 알람에서 제거하고 거절했다는 메세지 추가
  const cancelGameAlarm = useCallback((rep: string) => {
    console.log('rep: ', rep);
    setGameAlarm(prev => {
      const foundIndex = prev.findIndex(item => {
        if (typeof item.invite_game_info !== 'string') {
          return item.invite_game_info.inviter_nickname === rep;
        }
        return false;
      });
      console.log('foundIndex: ', foundIndex);

      if (foundIndex === -1) {
        return prev;
      }

      const updatedNode = {...prev[foundIndex]};
      updatedNode.invite_game_info = rep;
      updatedNode.event_type = InviteGameEnum.LEFTWAITINGROOM;

      const updatedAlarmList = [
        ...prev.slice(0, foundIndex),
        updatedNode,
        ...prev.slice(foundIndex + 1),
      ];
      return updatedAlarmList;
    });
  }, []);

  const inviterLogOut = useCallback((rep: string) => {
    setGameAlarm(prev => {
      console.log('초대자 나감rep: ', rep);
      const foundIndex = prev.findIndex(item => {
        if (typeof item.invite_game_info !== 'string') {
          return item.invite_game_info.inviter_nickname === rep;
        }
        return false;
      });
      console.log('foundIndex: ', foundIndex);

      if (foundIndex === -1) {
        return prev;
      }

      const updatedNode = {...prev[foundIndex]};
      updatedNode.invite_game_info = rep;
      updatedNode.event_type = InviteGameEnum.INVITER_OFF;

      const updatedAlarmList = [
        ...prev.slice(0, foundIndex),
        updatedNode,
        ...prev.slice(foundIndex + 1),
      ];
      return updatedAlarmList;
    });
  }, []);

  const inviteeLogOut = useCallback((rep: string) => {
    setGameAlarm(prev => {
      console.log('초대자 나감', rep);
      const foundIndex = prev.findIndex(item => {
        if (typeof item.invite_game_info !== 'string') {
          return item.invite_game_info.invitee_nickname === rep;
        }
        return false;
      });
      console.log('foundIndex: ', foundIndex);

      if (foundIndex === -1) {
        return prev;
      }

      const updatedNode = {...prev[foundIndex]};
      updatedNode.invite_game_info = rep;
      updatedNode.event_type = InviteGameEnum.INVITEE_OFF;

      const updatedAlarmList = [
        ...prev.slice(0, foundIndex),
        updatedNode,
        ...prev.slice(foundIndex + 1),
      ];
      return updatedAlarmList;
    });
  }, []);

  // 게임 초대 관련 이벤트
  useEffect(() => {
    chat_socket?.on('invite_game', inviteGameEvent);
    chat_socket?.on('invite_response', inviteGameMoveEvent);
    chat_socket?.on('invitee_cancel_game_out', cancelGameAlarm);
    chat_socket?.on('inviter_cancel_game_refresh', inviterLogOut);
    chat_socket?.on('invitee_cancel_game_refresh', inviteeLogOut);
    return () => {
      chat_socket?.off('invite_game', inviteGameEvent);
      chat_socket?.off('invite_response', inviteGameMoveEvent);
      chat_socket?.off('invitee_cancel_game_out', cancelGameAlarm);
      chat_socket?.off('inviter_cancel_game_refresh', inviterLogOut);
      chat_socket?.off('invitee_cancel_game_refresh', inviteeLogOut);
    };
  }, [
    chat_socket,
    inviteGameEvent,
    inviteGameMoveEvent,
    cancelGameAlarm,
    inviterLogOut,
    inviteeLogOut,
  ]);

  const handleChatAlarm = useCallback(
    (rep: Chatnotificate) => {
      console.log(rep);
      setChatAlarm(preNotis => [...preNotis, rep]);
      setReadNotificate(true);
    },
    [setReadNotificate, setChatAlarm]
  );

  // 채팅 관련 이벤트
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
