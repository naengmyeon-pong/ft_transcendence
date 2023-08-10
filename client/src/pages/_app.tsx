import type {AppProps} from 'next/app';

import {RecoilRoot} from 'recoil';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import AlertSnackbar from '@/components/AlertSnackbar';
import GlobalDialog from '@/components/GlobalDialog';

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <RecoilRoot>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Component {...pageProps} />
        </Box>
        <GlobalDialog />
        <AlertSnackbar />
      </Container>
    </RecoilRoot>
  );
}
