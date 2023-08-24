'use client';

import {useRouter} from 'next/router';
import {ComponentType, useEffect} from 'react';

import {isValidUserToken} from '@/api/auth';
import {getJwtToken} from '@/utils/token';

interface WithAuthProps {
  token: string | null;
}

const withAuth = <P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>
) => {
  return function ComponentWithAuth(props: Omit<P, keyof WithAuthProps>) {
    const router = useRouter();

    useEffect(() => {
      const verifyToken = async () => {
        if (getJwtToken() === null) {
          router.push('/user/login');
        } else if (await isValidUserToken()) {
          router.push('/main/game');
        } else {
          sessionStorage.removeItem('accessToken');
          router.push('/user/login');
        }
      };

      verifyToken();
    }, []);

    return <WrappedComponent {...(props as P)} />;
  };
};
export default withAuth;
