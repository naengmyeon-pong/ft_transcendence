'use client';

import {useRouter} from 'next/navigation';
import {isValidJwtToken} from '@/app/api/auth';
import {useEffect, useState} from 'react';
import {CircularProgress} from '@mui/material';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      if ((await isValidJwtToken()) === true) {
        router.push('/main');
      } else {
        router.push('/login');
      }
      setIsLoading(true);
    })();
  }, []);

  if (isLoading) {
    return (
      <>
        <CircularProgress />
      </>
    );
  }
  return <></>;
}
