// src/component/chat.tsx
"use client"
import { useChat } from '@/context/ChatContext';
import React from 'react';

const Chat: React.FC = () => {
  const {
    messages,
    sendMessage,
    setText,
    inputRef,
    // showNameBox,
    // setName,
    // nameBoxHandler,
  } = useChat();

  return (
    <section className="h-[100dvh] w-full bg-black text-white relative">
      <div className="h-[calc(100dvh-80px)] overflow-y-auto p-2">
        {messages.map((m, index) => (
          <div key={index} className="mb-2 p-2 border-b rounded-lg bg-neutral-700">
            {m}
          </div>
        ))}
      </div>
      <div className="h-20 px-3 gap-3 flex items-center">
        <input ref={inputRef} type="text" onChange={setText} className="w-full" />
        <button className="bg-purple-600 px-3 py-2 rounded-lg" onClick={sendMessage}>
          Send
        </button>
      </div>
      {/* <div className="absolute p-2 flex gap-2 top-0 right-0">
        {showNameBox && <input type="text" onChange={setName} className="w-40" />}
        <button onClick={nameBoxHandler} className="bg-purple-600 px-3 py-2 rounded-lg">
          {showNameBox ? 'Set name' : 'Click to enter name'}
        </button>
      </div> */}
    </section>
  );
};

export default Chat;
