'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

import CircularProgress from '@mui/material/CircularProgress';

import {isValidJwtToken} from '@/api/auth';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      if ((await isValidJwtToken()) === true) {
        router.push('/main');
      } else {
        router.push('/user/login');
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
