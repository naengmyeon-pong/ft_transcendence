'use client';

import {useEffect, useState} from 'react';

import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import apiManager from '@/api/apiManager';

function SimpleRecord() {
  const [recentRecord, setRecentRecord] = useState<string[]>([]);
  const [win, setWin] = useState<number>(0);
  const [lose, setLose] = useState<number>(0);

  useEffect(() => {
    const getUserRecord = async () => {
      try {
        const response = await apiManager.get('/record/simple?id=user1');
        console.log(response);
        setRecentRecord(response.data.recent_record);
      } catch (error) {
        console.log(error);
      }
    };

    getUserRecord();
  }, []);

  return (
    <>
      <Typography variant="h6">최근 {recentRecord.length}경기 전적</Typography>
      <Typography color="text.secondary">
        {win} 승 {lose} 패 (승률 {(win / 5) * 100}%){' '}
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
    </>
  );
}

export default SimpleRecord;
