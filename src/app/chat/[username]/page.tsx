"use client"
import Chat from '@/components/Chat'
import { ChatProvider } from '@/context/ChatContext'
import React from 'react'

const ChatPage = () => {
  return (
    <ChatProvider>

      <Chat/>
    </ChatProvider>
  )
}

export default ChatPage