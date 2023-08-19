'use client';

import {useEffect, useState} from 'react';

import {useInfiniteQuery} from 'react-query';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import apiManager from '@/api/apiManager';
import {UserType} from '@/types/UserContext';
import RecordTable from '@/components/Record/RecordTable';
import TabPanel from '@/components/Record/TabPanel';

function tabYprops(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
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

function DetailRecord({user_info}: {user_info: UserType}) {
  const [recentRecordState, setRecentRecordState] = useState<string[]>([]);
  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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

  return (
    <>
      <Box sx={{width: '100%'}}>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="user game records"
            variant="fullWidth"
          >
            <Tab label="일반 게임" {...tabYprops(0)} />
            <Tab label="랭크 게임" {...tabYprops(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <RecordTable />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <RecordTable />
        </TabPanel>
      </Box>
    </>
  );
}

export default DetailRecord;
