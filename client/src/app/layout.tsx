import type {Metadata} from 'next';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export const metadata: Metadata = {
  title: 'Naeng-myeon pong',
  description: 'Play naeng-myeon pong',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
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
            {children}
          </Box>
        </Container>
      </body>
    </html>
  );
}
