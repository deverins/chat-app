import Chat from '@/components/Chat';
import { ChatProvider } from '@/context/ChatContext';
import React from 'react';

function Home() {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
}

export default Home;
