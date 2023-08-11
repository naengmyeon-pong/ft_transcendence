'use client';

import {
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';

function ConnectUserList() {
  return (
    <List>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Badge
            overlap="circular"
            color="success"
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            variant="dot"
          >
            <Avatar alt="friend profile memo" src="/logo.jpeg" />
          </Badge>
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
              {'온라인'}
            </Typography>
          }
        />
      </ListItem>
    </List>
  );
}

export default ConnectUserList;
