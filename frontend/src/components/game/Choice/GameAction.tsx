'use client';

import {Button, CircularProgress} from '@mui/material';
import {JoinGameInfo} from '@/common/types/game';
import {useContext} from 'react';
import {UserContext} from '@/components/layout/MainLayout/Context';

interface GameActionProps {
  setSelectedGameMode: React.Dispatch<React.SetStateAction<string>>;
  setSelectedGameType: React.Dispatch<React.SetStateAction<string>>;
  setIsWaitingGame: React.Dispatch<React.SetStateAction<boolean>>;
  gameType: string;
  gameMode: string;
  isWaitingGame: boolean;
  selectedGameType: string;
  selectedGameMode: string;
}

export default function GameAction({
  setSelectedGameMode,
  setSelectedGameType,
  setIsWaitingGame,
  gameType,
  gameMode,
  isWaitingGame,
  selectedGameType,
  selectedGameMode,
}: GameActionProps) {
  const {chat_socket} = useContext(UserContext);

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  const handleGameStart = () => {
    console.log(`gameType: ${gameType}, gameMode: ${gameMode}`);
    if (gameType === '') {
      console.error('게임 타입을 선택해주세요!');
      return;
    }
    if (gameMode === '') {
      console.error('게임 난이도를 선택해주세요!');
      return;
    }
    const jwtToken = sessionStorage.getItem('accessToken');
    // TODO: 에러 처리 추가하기
    // TODO: 토큰 만료 시간 확인 추가하기
    if (jwtToken === null) {
      return;
    }
    setSelectedGameMode(gameMode);
    setSelectedGameType(gameType);
    const joinGameInfo: JoinGameInfo = {
      jwt: jwtToken,
      mode: gameMode,
      type: gameType,
    };
    chat_socket?.emit('join_game', joinGameInfo);
    setIsWaitingGame(true);
    window.addEventListener('beforeunload', handleBeforeUnload);
  };

  const handleStopWaiting = () => {
    const jwtToken = sessionStorage.getItem('accessToken');
    if (jwtToken === null) {
      return;
    }
    const joinGameInfo: JoinGameInfo = {
      jwt: jwtToken,
      mode: selectedGameMode,
      type: selectedGameType,
    };
    chat_socket?.emit('cancel_waiting', joinGameInfo);
    setIsWaitingGame(false);
    setSelectedGameMode('');
    setSelectedGameType('');
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };

  return (
    <>
      <Button
        variant="contained"
        color={isWaitingGame ? 'error' : 'success'}
        onClick={handleGameStart}
      >
        {isWaitingGame ? '상대 대기중' : '게임 시작'}
      </Button>
      {isWaitingGame && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            color: 'white',
            marginTop: '5px',
            marginLeft: '-60px',
          }}
        />
      )}
      {isWaitingGame && (
        <Button variant="outlined" onClick={handleStopWaiting}>
          대기 취소
        </Button>
      )}
    </>
  );
}
