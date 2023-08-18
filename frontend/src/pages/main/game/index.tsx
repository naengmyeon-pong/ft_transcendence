'use client';

import {useContext, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {Button, Grid} from '@mui/material';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import {CircularProgress} from '@mui/material';
import Pong from '@/components/game/Pong';

import {GameInfo, RoomUserInfo, JoinGameInfo} from '@/common/types/game';
import {UserContext} from '@/components/layout/MainLayout/Context';

function Game() {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [gameType, setGameType] = useState<string>('');
  const [gameMode, setGameMode] = useState<string>('');
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [selectedGameMode, setSelectedGameMode] = useState<string>('');
  const [isWaitingGame, setIsWaitingGame] = useState<boolean>(false);
  const [isStartingGame, setIsStartingGame] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const socket = useContext(UserContext).game_socket;

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };

  const handleUnload = () => {
    if (isWaitingGame === true) {
      const jwtToken = sessionStorage.getItem('accessToken');
      if (jwtToken === null) {
        return;
      }
      const joinGameInfo: JoinGameInfo = {
        jwt: jwtToken,
        mode: selectedGameMode,
        type: selectedGameType,
      };
      console.log('hey');
      socket?.emit('cancel_waiting', joinGameInfo);
    }
  };

  const handleGameType = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.currentTarget.value);
    setGameType(event.currentTarget.value);
  };

  const handleGameMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.currentTarget.value);
    setGameMode(event.currentTarget.value);
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
    socket?.emit('join_game', joinGameInfo);
    setIsWaitingGame(true);
    window.addEventListener('beforeunload', handleBeforeUnload);
  };

  const handleReturnMain = () => {
    setIsGameOver(false);
    setIsStartingGame(false);
    setIsWaitingGame(false);
    setGameInfo(null);
    setGameMode('');
    setGameType('');
    setSelectedGameMode('');
    setSelectedGameType('');
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
    socket?.emit('cancel_waiting', joinGameInfo);
    setIsWaitingGame(false);
    setSelectedGameMode('');
    setSelectedGameType('');
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };

  const handleNotice = (notice: string) => {
    console.log(notice);
  };

  const handleRoomname = (roomUserInfo: RoomUserInfo) => {
    const {
      room_name,
      left_user,
      right_user,
    }: {room_name: string; left_user: string; right_user: string} =
      roomUserInfo;

    sessionStorage.setItem('room_name', room_name);
    sessionStorage.setItem('left_user', left_user);
    sessionStorage.setItem('right_user', right_user);

    if (socket) {
      socket?.emit('update_frame', room_name);
      setIsStartingGame(true);
      setIsWaitingGame(false);
    }
  };

  const handleGameInfo = ({game_info}: {game_info: GameInfo}) => {
    if (game_info === null) {
      return;
    }
    setGameInfo(game_info);
    if (game_info.leftScore === 5 || game_info.rightScore === 5) {
      setIsGameOver(true);
    }
  };

  useEffect(() => {
    socket?.on('notice', handleNotice);
    socket?.on('room_name', handleRoomname);
    socket?.on('game_info', handleGameInfo);
    window.addEventListener('unload', handleUnload);

    return () => {
      socket?.off('notice', handleNotice);
      socket?.off('room_name', handleRoomname);
      socket?.off('game_info', handleGameInfo);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isWaitingGame]);

  useEffect(() => {
    sessionStorage.removeItem('room_name');
    sessionStorage.removeItem('left_user');
    sessionStorage.removeItem('right_user');
  }, []);

  return (
    <>
      <Grid id="game-area" container justifyContent="center">
        {!isStartingGame && (
          <Grid id="game-selection" container>
            <Grid id="mode-selection" container justifyContent="center">
              <Grid item xs={4}>
                <FormControl>
                  <FormLabel id="game-mode-selection">게임 타입</FormLabel>
                  <RadioGroup
                    aria-labelledby="game-mode-selection"
                    name="radio-buttons-group"
                    onChange={handleGameType}
                  >
                    <FormControlLabel
                      value="normal"
                      control={<Radio />}
                      label="일반 게임"
                    />
                    <FormControlLabel
                      value="rank"
                      control={<Radio />}
                      label="랭크 게임"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl>
                  <FormLabel id="game-type-selection">게임 난이도</FormLabel>
                  <RadioGroup
                    aria-labelledby="game-type-selection"
                    name="radio-buttons-group"
                    onChange={handleGameMode}
                  >
                    <FormControlLabel
                      value="easy"
                      control={<Radio />}
                      label="일반 모드"
                    />
                    <FormControlLabel
                      value="hard"
                      control={<Radio />}
                      label="가속 모드"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
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
              </Grid>
            </Grid>
          </Grid>
        )}
        {isStartingGame && !isGameOver && (
          <Grid item xs={8}>
            <Pong socket={socket} gameInfo={gameInfo} />
          </Grid>
        )}
        {isGameOver && gameInfo !== null && (
          <Grid item>
            <p>
              {gameInfo.leftScore > gameInfo.rightScore
                ? sessionStorage.getItem('left_user')
                : sessionStorage.getItem('right_user')}
              승리!
            </p>
            <Button variant="contained" onClick={handleReturnMain}>
              메인으로 돌아가기
            </Button>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default Game;
