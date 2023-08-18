import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

interface UserLayoutProps {
  children: React.ReactNode;
}

function UserLayout({children}: UserLayoutProps) {
  return (
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
  );
}

export default UserLayout;
