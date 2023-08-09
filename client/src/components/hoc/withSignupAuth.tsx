'use client';

import {useRouter} from 'next/router';
import React, {ComponentType, useEffect} from 'react';

const withSignupAuth = (WrappedComponent: ComponentType) => {
  return props => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(async () => {
      const accessToken = localStorage.getItem('accessToken');
      // if no accessToken was found,then we redirect to "/" page.
      if (!accessToken) {
        router.replace('/');
      } else {
        // we call the api that verifies the token.
        const data = await verifyToken(accessToken);
        // if token was verified we set the state.
        if (data.verified) {
          setVerified(data.verified);
        } else {
          // If the token was fraud we first remove it from localStorage and then redirect to "/"
          localStorage.removeItem('accessToken');
          router.replace('/');
        }
      }
    }, []);

    if (verified) {
      return <WrappedComponent {...props} />;
    } else {
      return null;
    }
  };
};
export default withSignupAuth;
