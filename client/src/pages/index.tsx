'use client';

import CircularProgress from '@mui/material/CircularProgress';

import withAuth from '@/components/hoc/withAuth';

function Home() {
  return (
    <>
      <CircularProgress />
    </>
  );
}

export default withAuth(Home);
