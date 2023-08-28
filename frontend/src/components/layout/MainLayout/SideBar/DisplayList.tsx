import {UserType} from '@/types/UserContext';
import {List} from '@mui/material';
import {useContext} from 'react';
import {UserContext} from '../Context';
import Dm from './DMList/DMUser';
import BlockUser from './BlockList';
import Friend from './FriendList/Friend';
import DM from './DMList';

interface DisplayListProps {
  lstState: number;
  friend_list: UserType[];
}

export default function DisplayList({lstState, friend_list}: DisplayListProps) {
  const {block_users} = useContext(UserContext);
  return (
    <>
      {lstState === 1 ? (
        <List>
          {friend_list.map((node, index) => {
            return <Friend key={index} friend={node} />;
          })}
        </List>
      ) : lstState === 0 ? (
        <List>
          {Array.from(block_users.values()).map((node, index) => {
            return <BlockUser key={index} block_user={node} />;
          })}
        </List>
      ) : (
        <DM />
      )}
    </>
  );
}
