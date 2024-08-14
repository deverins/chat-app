"use client"
import React, { useRef } from 'react';

import { useRoomSocket } from '@/hooks/socketClient';

const Chat: React.FC = () => {

  const {messages, sendMessage, socket} = useRoomSocket()
  const inputRef = useRef<HTMLInputElement | null>(null);


  const processMessage = () => {
    const message = inputRef?.current?.value || "";
    if(!message.trim()) return;

    sendMessage(message)
    if (inputRef?.current) {
      inputRef.current.value = '';
    }
    }

  return (
    <section className="h-[100dvh] w-full bg-black text-white relative">
      <div className="h-[calc(100dvh-80px)] overflow-y-auto p-2">
        {messages.map((m, index) => (
          <div key={index} className="mb-2 p-2 border-b rounded-lg bg-neutral-700">
            {m.message}
          </div>
        ))}
      </div>
      <div className="h-20 px-3 gap-3 flex items-center">
        <input ref={inputRef} type="text" className="w-full" />
        <button className="bg-purple-600 px-3 py-2 rounded-lg" onClick={processMessage}>
          Send
        </button>
      </div>
    </section>
  );
};

export default Chat;
