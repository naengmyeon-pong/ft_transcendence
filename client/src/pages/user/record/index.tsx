'use client';

import {useRouter} from 'next/navigation';
import React, {useEffect, useState} from 'react';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';

import apiManager from '@/api/apiManager';
import withAuth from '@/components/hoc/withAuth';

import * as HTTP_STATUS from 'http-status';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';

interface SimpleRecordDto {
  win: number;
  lose: number;
  rank_score: number;
  forfeit: number;
  recent_record: string[];
}

function RecordPage() {
  const {openGlobalDialog, closeGlobalDialog} = useGlobalDialog();
  const [recentRecordState, setRecentRecordState] = useState<string[]>([]);

  useEffect(() => {
    const getUserRecord = async () => {
      try {
        const response = await apiManager.get('/record/simple?id=user1');
        console.log(response.data.recent_record);
        setRecentRecordState(response.data.recent_record);
      } catch (error) {
        console.log(error);
      }
    };

    getUserRecord();
  }, []);

  return (
    <>
      <Typography>전적 페이지</Typography>
      {recentRecordState.map((value, idx) => (
        <li key={idx}>{value}</li>
      ))}
    </>
  );
}

export default RecordPage;
