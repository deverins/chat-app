"use client"
import React from 'react';

import Chat from './../../../components/Chat';
import PublicChat from './../../../components/PublicChat';
import { useParams } from 'next/navigation';
// import { ChatProvider } from '@/hooks/ChatContext';

const ChatPage = () => {

  const { receiver } = useParams();
  return (<>
    {receiver === "PUBLIC_ROOM" ?
      <Chat /> :
      <PublicChat />
    }
  </>
    // <ChatProvider>

    //   <Chat/>
    // </ChatProvider>
  )
}

export default ChatPage