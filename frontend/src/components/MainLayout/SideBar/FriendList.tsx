'use client';

import {
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  styled,
} from '@mui/material';

const StyledBadge = styled(Badge)(({theme}) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'grey',
    color: 'grey',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

// TODO: 유저명, 이미지, 유저상태 변경 필요합니다
function FriendList() {
  return (
    <List>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            variant="dot"
          >
            <Avatar alt="friend profile memo" src="/logo.jpeg" />
          </StyledBadge>
        </ListItemAvatar>
        <ListItemText
          primary={'username'}
          secondary={
            <Typography
              sx={{display: 'inline'}}
              component="span"
              variant="body2"
              color="text.primary"
            >
              {'오프라인'}
            </Typography>
          }
        />
      </ListItem>
    </List>
  );
}

export default FriendList;
