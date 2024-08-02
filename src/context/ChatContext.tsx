// src/context/ChatContext.tsx
import socket from '@/utils/socket';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
interface ChatContextProps {
  messages: string[];
  input: string;
  setInput: (input: string) => void;
  sendMessage: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('chat message', input);
      setInput('');
    }
  };

  return (
    <ChatContext.Provider value={{ messages, input, setInput, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
