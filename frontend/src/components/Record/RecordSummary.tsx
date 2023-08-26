'use client';

import {useEffect, useState} from 'react';

import axios from 'axios';
import {useSetRecoilState} from 'recoil';
import * as HTTP_STATUS from 'http-status';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import apiManager from '@/api/apiManager';
import {UserType} from '@/types/UserContext';
import {useAlertSnackbar} from '@/hooks/useAlertSnackbar';
import {tokenExpiredExit} from '@/states/tokenExpired';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';

function RecordSummary({user_info}: {user_info: UserType}) {
  const {openAlertSnackbar} = useAlertSnackbar();
  const {closeGlobalDialog} = useGlobalDialog();
  const setTokenExpiredExit = useSetRecoilState(tokenExpiredExit);
  const [recentRecord, setRecentRecord] = useState<string[]>([]);
  const [win, setWin] = useState<number>(0);
  const [lose, setLose] = useState<number>(0);
  const [winRate, setWinRate] = useState<string>('');
  const [totalWin, setTotalWin] = useState<number>(0);
  const [totalLose, setTotalLose] = useState<number>(0);
  const [totalWinRate, setTotalWinRate] = useState<string>('');
  const [rankScore, setRankScore] = useState<number>(0);

  useEffect(() => {
    const getUserRecord = async () => {
      try {
        const response = await apiManager.get(
          `/record/simple?id=${user_info.id}`
        );
        let numberWin = 0;
        let numberLose = 0;
        const recentRecord: string[] = response.data.recent_record;
        setRecentRecord(recentRecord);
        recentRecord.map((record: string) => {
          if (record === '승') {
            numberWin += 1;
          } else {
            numberLose += 1;
          }
        });
        const numberWinRate = (numberWin / (numberWin + numberLose)) * 100;

        setWin(numberWin);
        setLose(numberLose);
        if (isNaN(numberWinRate)) {
          setWinRate('0');
        } else {
          setWinRate(numberWinRate.toFixed(2));
        }

        const numberTotalWin = Number(response.data.win);
        const numberTotalLose = Number(response.data.lose);
        const numberTotalWinRate =
          (numberTotalWin / (numberTotalWin + numberTotalLose)) * 100;
        setTotalWin(numberTotalWin);
        setTotalLose(numberTotalLose);
        if (isNaN(numberWinRate)) {
          setTotalWinRate('0');
        } else {
          setTotalWinRate(numberTotalWinRate.toFixed(2));
        }

        const numberRankScore = Number(response.data.rank_score);
        setRankScore(numberRankScore);
      } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
          openAlertSnackbar({message: error.response?.data.message});
          if (HTTP_STATUS.UNAUTHORIZED) {
            closeGlobalDialog();
            setTokenExpiredExit(true);
          }
        }
      }
    };

    getUserRecord();
  }, []);

  return (
    <>
      <Box sx={{mb: 2}}>
        <Typography variant="h6">전체 전적</Typography>
        <Typography color="text.secondary">랭크 점수 : {rankScore}</Typography>
        <Typography color="text.secondary">
          {totalWin + totalLose} 전 {totalWin} 승 {totalLose} 패 (승률{' '}
          {totalWinRate}%)
        </Typography>
      </Box>
      <Box sx={{mb: 2}}>
        <Typography variant="h6">
          최근 {recentRecord.length}경기 전적
        </Typography>
        <Typography color="text.secondary">
          {win + lose} 전 {win} 승 {lose} 패 (승률 {winRate}%)
        </Typography>
        <Stack direction="row" spacing={1} sx={{mt: 2}}>
          {recentRecord.map((record, idx) => {
            return (
              <Chip
                key={idx}
                label={record}
                color={record === '승' ? 'success' : 'error'}
              />
            );
          })}
        </Stack>
      </Box>
    </>
  );
}

export default RecordSummary;
