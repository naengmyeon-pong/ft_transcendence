'use client';

import {useRouter} from 'next/router';
import React, {ComponentType, useState, useEffect} from 'react';
import {isValidJwtToken} from '@/api/auth';

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
        if (await isValidJwtToken()) {
          router.push('/game');
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
