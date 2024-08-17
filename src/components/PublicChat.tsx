"use client";
import React, { useRef, useEffect, useState } from "react";
import { useChatSocket } from "@/hooks/socketClient";

interface Message {
  senderName: string;
  message: string;
  time: string;
}

const PublicChat: React.FC = () => {
  const { sendMessage, addMessage } = useChatSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const savedMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");
      console.log("Loaded messages from localStorage:", savedMessages);
      setMessages(savedMessages);
    } catch (error) {
      console.error("Failed to parse chat messages from localStorage", error);
      setMessages([]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    console.log("Saving messages to localStorage:", messages);
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const processMessage = () => {
    const message = inputRef?.current?.value || "";
    if (!message.trim()) return;

    const senderName = localStorage.getItem("username") || "Anonymous";

    const newMessage: Message = {
      senderName,
      message,
      time: new Date().toISOString(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    addMessage(newMessage);
    sendMessage(message);

    if (inputRef?.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <section className="h-[100dvh] w-full bg-black text-white relative">
      <div className="h-[calc(100dvh-80px)] overflow-y-auto p-2">
        {messages.map((m, index) => {
          const isSender = m.senderName === localStorage.getItem("username");

          return (
            <div
              key={index}
              className={`flex mb-2 mx-4 ${isSender ? "justify-end" : "justify-start mt-4"
                }`}
            >
              <div
                className={`relative max-w-full md:max-w-[65%] lg:max-w-[75%] p-3 rounded-lg ${isSender
                    ? "bg-purple-500 text-white rounded-br-none"
                    : "bg-neutral-700 text-white rounded-bl-none"
                  }`}
              >
                <div className="font-bold mb-1">{m.senderName}</div>
                <div>{m.message}</div>
                <div className="text-xs mt-2 text-right text-gray-300">
                  {new Date(m.time).toLocaleTimeString()}
                </div>
                <div
                  className={`absolute w-3 h-3 top-2 ${isSender
                      ? "bg-purple-500 right-[-6px] transform rotate-45"
                      : "bg-neutral-700 left-[-6px] transform rotate-45"
                    }`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-20 px-3 gap-3 flex items-center">
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-neutral-800 p-2 rounded-lg text-white"
          placeholder="Type your message..."
        />
        <button
          className="bg-purple-600 px-4 py-2 rounded-lg text-white"
          onClick={processMessage}
        >
          Send
        </button>
      </div>
    </section>
  );
};

export default PublicChat;
