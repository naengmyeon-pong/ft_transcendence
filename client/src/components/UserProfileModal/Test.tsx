import {useGlobalModal} from '@/hooks/useGlobalModal';
import {useCallback} from 'react';
import {UserType} from '@/types/UserContext';
import {
  Avatar,
  Box,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';

const ModalContent = ({user_info}: {user_info: UserType}) => {
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="friend profile memo" src={`${user_info.image}`} />
      </ListItemAvatar>

      <ListItemText
        primary={user_info.nickName}
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
  );
};

export const Test = ({user_info}: {user_info: UserType}) => {
  const {openGlobalModal, closeGlobalModal} = useGlobalModal();

  const action = useCallback(() => {
    return (
      <Box display={'flex'} justifyContent={'space-between'}>
        <Button onClick={closeGlobalModal}>닫기</Button>
      </Box>
    );
  }, [closeGlobalModal]);

  function handleClick() {
    closeGlobalModal();
    console.log('모달 닫힘');
    openGlobalModal({
      title: '전적보기',
      content: <ModalContent user_info={user_info} />,
      action: action(),
    });
  }
  return <Button onClick={handleClick}>전적보기</Button>;
};
