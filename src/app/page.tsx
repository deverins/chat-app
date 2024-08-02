// src/app/page.tsx
"use client"; // This line is needed for client-side components

import Chat from '@/components/Chat';
import { ChatProvider } from '@/context/ChatContext';

const Page = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};

export default Page;
