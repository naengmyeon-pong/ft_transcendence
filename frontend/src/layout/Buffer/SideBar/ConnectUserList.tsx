import React from 'react';
import {
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';

export default function ConnectUserList() {
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
            <Avatar alt="friend profile memo" src="/Naengmyeon.png" />
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
