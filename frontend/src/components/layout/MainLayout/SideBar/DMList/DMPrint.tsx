import {DmChat} from '@/types/UserContext';
import {Box} from '@mui/material';
import {Message} from './Message';
import {useContext} from 'react';
import {UserContext} from '../../Context';

interface DMPrintProps {
  chat_scroll: React.RefObject<HTMLDivElement>;
  chats: DmChat[];
}

export default function DMPrint({chat_scroll, chats}: DMPrintProps) {
  const {user_id} = useContext(UserContext);
  return (
    <>
      <Box ref={chat_scroll} sx={{flexGrow: 1, overflow: 'auto'}}>
        {chats.map((message_node, index) => (
          <Message
            message={message_node.message}
            userId={message_node.userId}
            user_id={user_id}
            key={index}
          />
        ))}
      </Box>
    </>
  );
}
