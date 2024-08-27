"use client";
import React from 'react';
import Chat from '@/components/Chat';
import PublicChat from '@/components/PublicChat';
import { useParams } from 'next/navigation';

const ChatPage = () => {
  const { receiver } = useParams()as { receiver: string };

  return (
    <>
      {receiver === "PUBLIC_ROOM" ? <Chat /> : <PublicChat />}
    </>
  );
};

export default ChatPage;
