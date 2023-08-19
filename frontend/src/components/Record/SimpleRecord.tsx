'use client';

import {useEffect, useState} from 'react';

import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import apiManager from '@/api/apiManager';

function SimpleRecord() {
  const [recentRecord, setRecentRecord] = useState<string[]>([]);

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
    // MEMO: 무한으로 요청하는 버그 수정
  }, []);

  return (
    <>
      <Typography variant="h6">최근 {recentRecord.length}경기 전적</Typography>
      <Stack direction="row" spacing={1}>
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