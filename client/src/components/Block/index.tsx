import {UserType} from '@/types/UserContext';
import {Box, Typography} from '@mui/material';
import {useContext} from 'react';
import {UserContext} from '../MainLayout/Context';

export default function Block({block_user}: {block_user: UserType}) {
  const {socket, block_users} = useContext(UserContext);
  console.log('block_users:', block_users);
  const handleAddBlock = () => {
    socket?.emit('block-member', block_user.id);
    block_users.set(block_user.id, block_user);
  };

  const handleDelBlock = () => {
    socket?.emit('unblock-member', block_user.id);
    block_users.delete(block_user.id);
  };

  return (
    <>
      {!block_users.has(`${block_user.id}`) ? (
        <Typography onClick={() => handleAddBlock()}>차단</Typography>
      ) : (
        <Typography onClick={() => handleDelBlock()}>차단 해제</Typography>
      )}
    </>
  );
}
