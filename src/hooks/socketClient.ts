import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export type IMessage = {
  senderName: string;
  message: string;
  time: string;
};

let socket: Socket;

export const useChatSocket = () => {
  const { receiver } = useParams();
  const [messages, setMessages] = useState<IMessage[]>([]);

  const sendMessage = (message: string) => {
    const senderName = localStorage.getItem("username") || "Anonymous";

    if (receiver) {
      // Send private message
      socket.emit("privateMessage", {
        message,
        to: receiver,
        senderName,
        time: new Date().toISOString(),
      });
    } else {
      // Send public message
      socket.emit("PUBLIC_ROOM", {
        message,
        from: senderName,
        time: new Date().toISOString(),
      });
    }
  };

  const addMessage = (message: IMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  useEffect(() => {
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to server");

      const username = localStorage.getItem("username");
      if (username) {
        socket.emit("subscribe", username);
      }
    });

    if (receiver) {
      // Private chat
      socket.on("privateMessage", (response: IMessage) => {
        const formattedMessage = {
          ...response,
          time: new Date(response.time).toLocaleString(),
        };
        addMessage(formattedMessage);
      });
    } else {
      // Public chat
      socket.on("PUBLIC_ROOM", (response: IMessage) => {
        const formattedMessage = {
          ...response,
          time: new Date(response.time).toLocaleString(),
        };
        addMessage(formattedMessage);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [receiver]);

  return { messages, sendMessage, addMessage, socket };
};
