'use client';

import {useEffect, useState} from 'react';

import {useQuery} from 'react-query';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

import apiManager from '@/api/apiManager';
import TablePaginationActions from '@/components/Record/TablePaginationActions';
import {Typography} from '@mui/material';

const rowsPerPage = 5;

interface User {
  user_id: string;
  user_nickname: string;
}
interface DetailRecord {
  winner: User;
  loser: User;
  winnerId: string;
  loserId: string;
  winner_score: number;
  loser_score: number;
  is_forfeit: boolean;
  date: string;
}

interface FetchUserRecordProps {
  intraId: string;
  type: string;
  pageParam: number;
}

const fetchUserRecord = async ({
  intraId,
  type,
  pageParam = 1,
}: FetchUserRecordProps) => {
  try {
    const response = await apiManager.get(
      `/record/detail?id=${intraId}&type=${type}&page=${pageParam + 1}&size=5`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

function RecordTable({intraId, type}: {intraId: string; type: string}) {
  const [page, setPage] = useState<number>(0);
  const [records, setRecords] = useState<DetailRecord[]>([]);
  const [totalCounts, setTotalCounts] = useState<number>(0);

  const {data} = useQuery({
    queryKey: ['userRecord', type, page],
    queryFn: () => fetchUserRecord({intraId, type, pageParam: page}),
    keepPreviousData: true,
  });

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalCounts) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  useEffect(() => {
    if (data && data.records !== undefined) {
      setRecords(data.records);
      setTotalCounts(data.count);
      console.log(data.records);
    }
  }, [data]);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="custom pagination table">
        <TableBody>
          {records.map((record, idx) => (
            <TableRow key={idx}>
              <TableCell style={{width: 10}} align="center">
                <Chip
                  label={record.winner.user_id === intraId ? '승' : '패'}
                  color={
                    record.winner.user_id === intraId ? 'success' : 'error'
                  }
                />
              </TableCell>
              <TableCell style={{width: 30}} align="center">
                <Typography>
                  {record.winner.user_id === intraId
                    ? record.winner.user_nickname
                    : record.loser.user_nickname}
                </Typography>
              </TableCell>
              <TableCell style={{width: 10}} align="center">
                {record.winner.user_id === intraId
                  ? record.winner_score
                  : record.loser_score}{' '}
                :{' '}
                {record.winner.user_id === intraId
                  ? record.loser_score
                  : record.winner_score}
              </TableCell>
              <TableCell style={{width: 30}} align="center">
                <Typography>
                  {record.winner.user_id === intraId
                    ? record.loser.user_nickname
                    : record.winner.user_nickname}
                </Typography>
              </TableCell>
              <TableCell style={{width: 10}} align="center">
                <Chip
                  label={record.winner.user_id === intraId ? '패' : '승'}
                  color={
                    record.winner.user_id === intraId ? 'error' : 'success'
                  }
                />
              </TableCell>
            </TableRow>
          ))}
          {emptyRows > 0 && (
            <TableRow style={{height: 30 * emptyRows}}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={totalCounts}
              rowsPerPage={rowsPerPage}
              page={page}
              rowsPerPageOptions={[]}
              onPageChange={handleChangePage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default RecordTable;
