import express from "express";
import { createServer } from "http";
import next from "next";
import Models from "./models/user.model";
import { Server, Socket } from "socket.io";
import "dotenv/config";
import connectDB from "./src/lib/mongodbConnection";

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
  senderName: string,
  receiver?: string,
  type: "public" | "private",
  message: string
}

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const { User, Message } = Models;
nextApp.prepare().then(async () => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  server.use(express.json());

  let PUBLIC_ROOM = "PUBLIC_ROOM";

  await connectDB();

  const users = new Map();

  io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    socket.on(PUBLIC_ROOM, async ({ message, from }: MessagePayload) => {

      await saveMessage({message, senderName:from, type:'public'})
      socket.broadcast.emit(PUBLIC_ROOM, { message, from, type:'message' });
    });

    socket.on("subscribe", (username: string) => {
      users.set(username, socket.id);
      socket.username = username; 
      setStatus(username, "active");
      socket.broadcast.emit(PUBLIC_ROOM, { message:username, type:'new' });
    });

    // Listen for private messages
    socket.on("privateMessage", async({ to, message }) => {
      const recipientSocketId = users.get(to);
      if (recipientSocketId) {
        const senderName = socket.username as string
        io.to(recipientSocketId).emit("privateMessage", {
          senderName,
          message,
          time: new Date(),
        });
        // save message
        await saveMessage({message, senderName, receiver:to, type:'private'})
      }
    });

    // Handle disconnection
    socket.on("disconnect", async() => {
      console.log("User disconnected");
      const username = socket.username;
      if (username) {
        users.delete(username); 
        delete socket.username;
        await setStatus(username, 'inactive');
      }
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected");
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
  if (!user) return;
  user.status = status;
  await user.save();
}

async function saveMessage({
  senderName,
  receiver,
  type,
  message
}: IMessage): Promise<boolean> {
  try {
    const _sender = await User.findOne({username: senderName});
    if(!_sender) return false;
    const sender = _sender._id;
    await Message.create({sender,receiver,type,message})
    return true;
  } catch (error) {
    console.log(error);    
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
