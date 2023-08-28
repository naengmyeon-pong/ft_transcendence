'use client';

import {useCallback, useContext, useEffect, useRef, useState} from 'react';

import {useRecoilState} from 'recoil';
import axios from 'axios';

import {Button, Grid} from '@mui/material';

import {UserContext} from '../layout/MainLayout/Context';
import {GameInfo, RoomUserInfo, JoinGameInfo} from '@/common/types/game';
import GameType from './Choice/GameType';
import GameMode from './Choice/GameMode';
import GameAction from './Choice/GameAction';
import Pong from './Pong';
import {profileState} from '@/states/profile';
import apiManager from '@/api/apiManager';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';

function Game() {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [gameType, setGameType] = useState<string>('');
  const [gameMode, setGameMode] = useState<string>('');
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [selectedGameMode, setSelectedGameMode] = useState<string>('');
  const [isWaitingGame, setIsWaitingGame] = useState<boolean>(false);
  const [isStartingGame, setIsStartingGame] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const socket = useContext(UserContext).chat_socket;
  const [profileDataState, setProfileDataState] = useRecoilState(profileState);
  const {openAlertSnackbar} = useAlertSnackbar();
  const is_game_over_ref = useRef(false);
  const is_game_start_ref = useRef(false);

  // 게임이 시작전에 나가면 cancel_waiting
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
      socket?.emit('cancel_waiting', joinGameInfo);
    }
  };

  const sendCancelWaiting = useCallback(() => {
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
      socket?.emit('cancel_waiting', joinGameInfo);
    }
  }, [socket, selectedGameMode, selectedGameType, isWaitingGame]);

  useEffect(() => {
    return () => {
      if (is_game_start_ref.current === false) {
        sendCancelWaiting();
      }
    };
  }, [sendCancelWaiting]);

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
      is_game_start_ref.current = true;
    }
  };

  const handleGameInfo = async ({game_info}: {game_info: GameInfo}) => {
    if (game_info === null) {
      return;
    }
    setGameInfo(game_info);
    if (game_info.leftScore === 5 || game_info.rightScore === 5) {
      setIsGameOver(true);
      is_game_over_ref.current = true;
      try {
        const response = await apiManager.get('/user/user-info');
        const {rank_score} = response.data;
        setProfileDataState({...profileDataState, rank_score});
      } catch (error) {
        if (axios.isAxiosError(error)) {
          openAlertSnackbar({
            message: '프로필 정보를 불러오는데 실패했습니다.',
          });
        }
      }
    }
  };

  useEffect(() => {
    is_game_start_ref.current = false;
    is_game_over_ref.current = false;
    return () => {
      if (
        is_game_start_ref.current === true &&
        is_game_over_ref.current === false
      ) {
        socket?.emit('exit_game');
      }
    };
  }, [socket]);

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
                {/* <GameType node={gameType} setNode={setGameMode} /> */}
                <GameType setGameType={setGameType} />
              </Grid>
              <Grid item xs={4}>
                <GameMode setGameMode={setGameMode} />
              </Grid>
              <Grid item xs={4}>
                <GameAction
                  setSelectedGameMode={setSelectedGameMode}
                  setSelectedGameType={setSelectedGameType}
                  gameMode={gameMode}
                  gameType={gameType}
                  setIsWaitingGame={setIsWaitingGame}
                  isWaitingGame={isWaitingGame}
                  selectedGameType={selectedGameType}
                  selectedGameMode={selectedGameMode}
                />
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
