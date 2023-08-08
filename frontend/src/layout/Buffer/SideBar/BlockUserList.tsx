import React, {useContext, useEffect, useState} from 'react';
import {
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import {UserContext} from 'Context';

export default function BlockUserList() {
  const {block_users} = useContext(UserContext);

  return (
    <List>
      {Array.from(block_users).map(node => (
        <ListItem alignItems="flex-start" key={node}>
          {/* ListItem 내부에서 JSX 요소 생성 */}
          <ListItemText primary={`${node.toString()}`} />
          {/* 아바타 및 기타 컴포넌트 추가 */}
        </ListItem>
      ))}
      {/* <ListItem alignItems="flex-start">
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
      </ListItem> */}
    </List>
  );
}
