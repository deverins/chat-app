"use client"
import React, { createContext, useContext, useState, useEffect, useRef, ChangeEvent } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatContextProps {
  message: string;
  messages: string[];
  userName: string;
  chatName: string;
  roomName: string;
  showNameBox: boolean;
  setMessage: (message: string) => void;
  setMessages: (messages: string[]) => void;
  setUserName: (userName: string) => void;
  setChatName: (chatName: string) => void;
  setRoomName: (roomName: string) => void;
  setShowNameBox: (showNameBox: boolean) => void;
  sendMessage: () => void;
  setText: (event: ChangeEvent<HTMLInputElement>) => void;
  setName: (event: ChangeEvent<HTMLInputElement>) => void;
  nameBoxHandler: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [chatName, setChatName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [showNameBox, setShowNameBox] = useState(false);

  useEffect(() => {
    const socket: Socket = io();

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('roomName', (name: string) => {
      console.log({ roomName: name });
      setRoomName(name);
    });

    socket.on('error', (err) => {
      console.log(err);
    });

    if (chatName) {
      socket.emit('userName', chatName);
    }

    if (roomName && roomName.includes(chatName)) {
      console.log(roomName, chatName, 'room and chat');

      socket.on(roomName, (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [chatName, roomName]);

  const sendMessage = () => {
    if (message && roomName && chatName && roomName.includes(chatName)) {
      const socket: Socket = io();
      socket.emit(roomName, message);
      if (inputRef?.current) {
        inputRef.current.value = '';
      }
      setMessage('');
    }
  };

  const setText = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const setName = (event: ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const nameBoxHandler = () => {
    if (!showNameBox) {
      setShowNameBox(true);
    } else {
      setChatName(userName);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        message,
        messages,
        userName,
        chatName,
        roomName,
        showNameBox,
        setMessage,
        setMessages,
        setUserName,
        setChatName,
        setRoomName,
        setShowNameBox,
        sendMessage,
        setText,
        setName,
        nameBoxHandler,
        inputRef,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
