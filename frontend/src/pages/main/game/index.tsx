'use client';

import {useContext, useEffect, useState} from 'react';
import {Button, Grid} from '@mui/material';
import Pong from '@/components/game/Pong';

import {GameInfo, RoomUserInfo, JoinGameInfo} from '@/common/types/game';
import {UserContext} from '@/components/layout/MainLayout/Context';
import {useRecoilState, useRecoilValue} from 'recoil';
import {InviteGameUserType, inviteGameState} from '@/states/inviteGame';
import GameType from '@/components/game/Choice/GameType';
import GameMode from '@/components/game/Choice/GameMode';
import GameAction from '@/components/game/Choice/GameAction';

function InviteGame() {
  const {chat_socket, user_id} = useContext(UserContext);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [isStartingGame, setIsStartingGame] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [invite_game_state, setInviteGameState] =
    useRecoilState(inviteGameState);

  const handleReturnMain = () => {
    setIsGameOver(false);
    setIsStartingGame(false);
    setGameInfo(null);
  };

  useEffect(() => {
    chat_socket?.emit('enter_game', {
      user_id: user_id,
      room_name: invite_game_state.inviter_id,
    });
    // 게임방에 대한 정보를 받아오는 이벤트(유저의 닉네임 등)
    // chat_socket?.on('room_name', handleRoomname);
    // 게임에 대한 업데이트를 받아오는 이벤트
    // chat_socket?.on('game_info', handleGameInfo);

    return () => {};
  }, []);

  return (
    <>
      {isStartingGame && !isGameOver && (
        <Grid item xs={8}>
          <Pong socket={chat_socket} gameInfo={gameInfo} />
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
    </>
  );
}

function GameManager() {
  const invite_game_state = useRecoilValue(inviteGameState);

  return <>{invite_game_state === null ? <Game /> : <InviteGame />}</>;
}

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

export default GameManager;
