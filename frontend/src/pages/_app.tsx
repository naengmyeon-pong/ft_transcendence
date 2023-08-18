import type {AppProps} from 'next/app';
import {useRouter} from 'next/router';

import {RecoilRoot} from 'recoil';
import {QueryClient, QueryClientProvider} from 'react-query';

import AlertSnackbar from '@/components/AlertSnackbar';
import GlobalDialog from '@/components/GlobalDialog';
import UserLayout from '@/components/layout/UserLayout';
import MainLayout from '@/components/layout/MainLayout';
import {UserProvider} from '@/components/MainLayout/Context';
import CustomModal from '@/components/GlobalModal';

export default function MyApp({Component, pageProps}: AppProps) {
  const router = useRouter();
  const queryClient = new QueryClient();

  // Check if the current route starts with '/user'
  const isUserRoute = router.pathname.startsWith('/user');

  // Check if the current route starts with '/main'
  const isMainRoute = router.pathname.startsWith('/main');

  return (
    <RecoilRoot>
<QueryClientProvider client={queryClient}>
      {(isUserRoute || router.pathname === '/') && (
        <UserLayout>
          <Component {...pageProps} />
        </UserLayout>
      )}
      {isMainRoute && (
        <UserProvider>
          <MainLayout>
            <CustomModal />
            <Component {...pageProps} />
          </MainLayout>
        </UserProvider>
      )}
      <GlobalDialog />
      <AlertSnackbar />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
