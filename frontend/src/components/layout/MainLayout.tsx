import CustomAppBar from '@/components/MainLayout/CustomAppBar';
import {Box, Grid, Toolbar} from '@mui/material';
import SideBar from '@/components/MainLayout/SideBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({children}: MainLayoutProps) {
  return (
    <>
      <CustomAppBar />
      <Toolbar />
      <Box display="flex">
        <Box>
          <SideBar />
        </Box>
        <Grid container justifyContent="center">
          <Grid item xs={8}>
            {/* 게임하기, 전체랭킹, 채팅목록 */}
            {children}
            {/* 개인 채팅창 위치 */}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default MainLayout;
