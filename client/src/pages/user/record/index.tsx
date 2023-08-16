'use client';

import {useRouter} from 'next/navigation';
import React, {useEffect, useState, useRef} from 'react';

import {useInfiniteQuery} from 'react-query';
import InfiniteScroll from 'react-infinite-scroller';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import {Divider} from '@mui/material';

import apiManager from '@/api/apiManager';
import withAuth from '@/components/hoc/withAuth';
import RecordItem from '@/components/RecordItem';

import * as HTTP_STATUS from 'http-status';
import {useGlobalDialog} from '@/hooks/useGlobalDialog';

interface SimpleRecord {
  win: number;
  lose: number;
  rank_score: number;
  forfeit: number;
  recent_record: string[];
}

interface DetailRecord {
  left_user: string;
  right_user: string;
  result: string; // 승, 패, 몰수승, 몰수패
  left_score: number;
  right_score: number;
  type: string; // 일반, 랭크
  mode: string; // 이지, 하드
}

interface FetchUserRecordProps {
  pageParam: number;
}

const fetchUserRecord = async ({pageParam = 1}: FetchUserRecordProps) => {
  try {
    const response = await apiManager.get(
      `/record/detail?id=user1&page=${pageParam}&size=5`
    );
    // console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

function RecordPage() {
  const {openGlobalDialog, closeGlobalDialog} = useGlobalDialog();
  const {data, fetchNextPage, hasNextPage, isLoading, isError} =
    useInfiniteQuery(
      ['getUserRecord'],
      ({pageParam = 1}) => fetchUserRecord({pageParam}),
      {
        getNextPageParam: lastPage => {
          const {pageNo, totalPage} = lastPage;

          if (pageNo === totalPage) {
            return false;
          }

          return pageNo + 1;
        },
      }
    );
  const [recentRecordState, setRecentRecordState] = useState<string[]>([]);

  // useEffect(() => {
  //   const getUserRecord = async () => {
  //     try {
  //       const response = await apiManager.get('/record/simple?id=user1');
  //       setRecentRecordState(response.data.recent_record);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   getUserRecord();
  // }, []);

  return (
    <>
      <Typography>전적 페이지</Typography>
      <InfiniteScroll hasMore={hasNextPage} loadMore={() => fetchNextPage()}>
        <RecordItem data={data} isLoading={isLoading} isError={isError} />
      </InfiniteScroll>
    </>
  );
}

export default RecordPage;
