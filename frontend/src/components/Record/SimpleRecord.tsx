'use client';

import {useEffect, useState} from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import apiManager from '@/api/apiManager';

function SimpleRecord() {
  const [recentRecord, setRecentRecord] = useState<string[]>([]);
  const [win, setWin] = useState<number>(0);
  const [lose, setLose] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(0);
  const [rankScore, setRankScore] = useState<number>(0);

  useEffect(() => {
    const getUserRecord = async () => {
      try {
        //TODO: id 를 현재 보고 있는 유저의 아이디로 변경하기
        const response = await apiManager.get('/record/simple?id=user1');
        console.log(response);
        setRecentRecord(response.data.recent_record);

        const numberWin = Number(response.data.win);
        const numberLose = Number(response.data.lose);
        setWin(numberWin);
        setLose(numberLose);
        setWinRate((numberWin / (numberWin + numberLose)) * 100);

        const numberRankScore = Number(response.data.rank_score);
        setRankScore(numberRankScore);
      } catch (error) {
        console.log(error);
      }
    };

    getUserRecord();
  }, []);

  return (
    <>
      <Box sx={{mb: 2}}>
        <Typography variant="h6">
          최근 {recentRecord.length}경기 전적
        </Typography>
        <Typography color="text.secondary">
          {win + lose} 전 {win} 승 {lose} 패 (승률 {(win / 5) * 100}%){' '}
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
      <Box sx={{mb: 2}}>
        <Typography variant="h6">전체 전적</Typography>
        <Typography color="text.secondary">랭크 점수 : {rankScore}</Typography>
        <Typography color="text.secondary">
          {win + lose} 전 {win} 승 {lose} 패 (승률 {winRate}%)
        </Typography>
      </Box>
    </>
  );
}

export default SimpleRecord;
