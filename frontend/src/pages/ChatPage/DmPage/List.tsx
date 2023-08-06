import React, {useContext, useEffect} from 'react';
import {Typography} from '@mui/material';
import {UserContext} from 'Context';
import apiManager from '@apiManager/apiManager';

export default function List() {
  const {user_id} = useContext(UserContext);

  async function init() {
    try {
      const rep = await apiManager.get('chatroom/dm_list', {
        params: {
          user_id: user_id,
        },
      });
      console.log('List.tsx: ', rep);
    } catch (error) {
      console.log('List.tsx: ', error);
    }
  }

  useEffect(() => {
    init();
  }, []);
  return (
    <>
      <Typography>List</Typography>
    </>
  );
}
