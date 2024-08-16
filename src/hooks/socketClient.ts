import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export type IMessage = {
  senderName: string;
  message: string;
  time: Date;
};

export const usePMSocket = () => {
  const { receiver } = useParams();

  const [messages, setMessages] = useState<IMessage[]>([]);

  const sendMessage = (message: string) => {
    socket.emit("privateMessage", { message, to: receiver });
  };

  useEffect(() => {
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("privateMessage", (response: IMessage) => {
      setMessages((prev) => prev.concat(response));
    });

    return () => {
      socket.disconnect();
    };
  }, [receiver]);

  return { messages, sendMessage, socket };
};

export const useRoomSocket = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const sendMessage = (message: string) => {
    socket.emit("PUBLIC_ROOM", { message, from: localStorage.userName });
  };

  useEffect(() => {
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("PUBLIC_ROOM", (response: IMessage) => {
      setMessages((prev) => prev.concat(response));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { messages, sendMessage, socket };
};
