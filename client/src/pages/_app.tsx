import type {AppProps} from 'next/app';
import {useRouter} from 'next/router';

import {RecoilRoot} from 'recoil';

import AlertSnackbar from '@/components/AlertSnackbar';
import GlobalDialog from '@/components/GlobalDialog';
import UserLayout from '@/components/layout/UserLayout';
import MainLayout from '@/components/layout/MainLayout';

export default function MyApp({Component, pageProps}: AppProps) {
  const router = useRouter();

  // Check if the current route starts with '/user'
  const isUserRoute = router.pathname.startsWith('/user');

  // Check if the current route starts with '/main'
  const isMainRoute = router.pathname.startsWith('/main');

  return (
    <RecoilRoot>
      {(isUserRoute || router.pathname === '/') && (
        <UserLayout>
          <Component {...pageProps} />
        </UserLayout>
      )}
      {isMainRoute && (
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      )}
      <GlobalDialog />
      <AlertSnackbar />
    </RecoilRoot>
  );
}
