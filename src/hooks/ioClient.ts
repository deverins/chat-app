// src/hooks/ioClient.ts
import { useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { useParams } from "next/navigation";

export type IMessage = {
  senderName: string;
  message: string;
  time: string;
};
export const ioClientHook = () => {
  const { receiver } = useParams() as { receiver: string }; // Make receiver optional
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_URL!, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
      const username = localStorage.getItem("username");
      if (username) {
        socketInstance.emit("subscribe", username);
      } else {
        console.error("Username not found in localStorage. Please set your username.");
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Listen to private or public messages
    socketInstance.on("privateMessage", (response: IMessage) => {
      const formattedMessage = {
        ...response,
        time: new Date(response.time).toLocaleString(),
      };
      addMessage(formattedMessage);
    });

    socketInstance.on("PUBLIC_ROOM", (response: IMessage) => {
      const formattedMessage = {
        ...response,
        time: new Date(response.time).toLocaleString(),
      };
      addMessage(formattedMessage);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [receiver]);


  const sendMessage = (message: string) => {
    const senderName = localStorage.getItem("username") || "Anonymous";

    if (socket) {
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
    } else {
      console.error("Socket is not connected. Unable to send message.");
    }
  };

  const addMessage = (message: IMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return { socket, isConnected, messages, sendMessage, addMessage };
};
