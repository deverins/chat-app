import express from "express";
import { createServer } from "http";
import next from "next";
import Models from "./models/user.model";
import { Server, Socket } from "socket.io";
import "dotenv/config";
import connectDB from "./src/lib/mongodbConnection";
import { Schema } from "mongoose";

declare module "socket.io" {
  interface Socket {
    username?: string;
  }
}

type MessagePayload = {
  message: string;
  from: string;
};

type IMessage = {
  senderName: string;
  receiver?: string;
  type: "public" | "private";
  message: string;
};

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const { User, Message } = Models;

nextApp.prepare().then(async () => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  server.use(express.json());

  const PUBLIC_ROOM = "PUBLIC_ROOM";

  await connectDB();

  const users = new Map();
  io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    socket.on("subscribe", async (username: string) => {
      users.set(username, socket.id);
      socket.username = username;
      await setStatus(username, "active");
      socket.join(PUBLIC_ROOM);
      socket.broadcast.to(PUBLIC_ROOM).emit(PUBLIC_ROOM, {
        message: `${username} has joined.`,
        from: "System",
        time: new Date().toISOString(),
        type: "public",
      });
    });

    socket.on(PUBLIC_ROOM, async ({ message, from }: MessagePayload) => {
      const formattedMessage = {
        message,
        from,
        type: "public",
        time: new Date().toISOString(),
      };

      await saveMessage({
        message,
        senderName: from,
        type: "public",
      });

      io.to(PUBLIC_ROOM).emit(PUBLIC_ROOM, formattedMessage);
    });

    socket.on("privateMessage", async ({ to, message }) => {
      const recipientSocketId = users.get(to);
      if (recipientSocketId) {
        const senderName = socket.username as string;
        io.to(recipientSocketId).emit("privateMessage", {
          senderName,
          message,
          time: new Date().toISOString(),
        });

        await saveMessage({
          message,
          senderName,
          receiver: to,
          type: "private",
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected");
      const username = socket.username;
      if (username) {
        users.delete(username);
        await setStatus(username, "inactive");
      }
    });
  });

  server.all("*", (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

async function setStatus(username: string, status: "active" | "inactive") {
  const user = await User.findOne({ username });
  if (user) {
    user.status = status;
    await user.save();
  }
}

async function saveMessage({
  senderName,
  receiver,
  type,
  message,
}: IMessage): Promise<boolean> {
  try {
    const _sender = await User.findOne({ username: senderName });
    if (!_sender) {
      console.error(`Sender not found: ${senderName}`);
      return false;
    }
    const sender = _sender._id;

    let receiverId: Schema.Types.ObjectId | null = null;
    if (type === "private" && receiver) {
      const _receiver = await User.findOne({ username: receiver });
      if (_receiver) {
        receiverId = _receiver._id;
      } else {
        console.error(`Recipient not found for username: ${receiver}`);
        return false;
      }
    }

    await Message.create({
      sender,
      receiver: receiverId,
      type,
      status: "unseen",
      message,
      timestamp: new Date(),
    });

    return true;
  } catch (error: any) {
    console.error(`Failed to save message: ${error.message}`);
    return false;
  }
}

/**
 * 
 * // Listen for joining a room
    socket.on('joinRoom', (room) => {
        socket.join(room);

        // Add user to the room's list
        if (!rooms.has(room)) {
            rooms.set(room, new Set());
        }
        rooms.get(room).add(socket.username);

        // Broadcast updated online users list to the room
        io.to(room).emit('onlineUsers', Array.from(rooms.get(room)));

        console.log(`${socket.username} joined room ${room}`);
    });

    // Listen for public messages in a room
    socket.on('publicMessage', ({ room, message }) => {
        io.to(room).emit('publicMessage', {
            from: socket.username,
            message,
        });
    });

    // Listen for leaving a room
    socket.on('leaveRoom', (room) => {
        socket.leave(room);

        // Remove user from the room's list
        if (rooms.has(room)) {
            rooms.get(room).delete(socket.username);

            // If the room is empty, delete it
            if (rooms.get(room).size === 0) {
                rooms.delete(room);
            } else {
                // Otherwise, broadcast the updated online users list
                io.to(room).emit('onlineUsers', Array.from(rooms.get(room)));
            }
        }

        console.log(`${socket.username} left room ${room}`);
    });

 */
