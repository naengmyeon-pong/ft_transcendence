'use client';

import {InfiniteData} from 'react-query';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

interface DetailRecord {
  winnerId: string;
  loserId: string;
  winner_score: number;
  loser_score: number;
  is_forfeit: boolean;
  date: string;
}

interface PageProps {
  pageNo: number;
  totalPage: number;
  records: DetailRecord[];
}

function RecordItem({
  data,
  isLoading,
  isError,
}: {
  data: InfiniteData<any> | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  // const records: DetailRecord[] = data;
  console.log(data);
  return (
    <>
      {isLoading ? (
        <Typography>로딩 중...</Typography>
      ) : (
        data.pages.map((page: PageProps) => {
          const {records}: {records: DetailRecord[]} = page;
          return records.map((record: DetailRecord) => {
            const {
              winnerId,
              loserId,
              winner_score,
              loser_score,
              is_forfeit,
              date,
            } = record;
            return (
              <>
                <Box sx={{mb: 3}}>
                  <Typography>날짜: {date}</Typography>
                  <Typography>
                    승자 : {winnerId} / 패자 : {loserId}
                  </Typography>
                  {is_forfeit && <Typography>몰수패</Typography>}
                  <Divider />
                </Box>
              </>
            );
          });
        })
      )}
    </>
  );
}

export default RecordItem;
