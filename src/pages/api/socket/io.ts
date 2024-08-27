import { Server as NetServer } from "net";
import { NextApiResponse, NextApiRequest } from "next";
import { Server as SocketIOServer, Socket as IOSocket } from "socket.io";
import Models from '@/lib/models/user.model';
import connectDB from "@/lib/mongodbConnection";

interface CustomSocket extends IOSocket {
  username?: string;
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

type NextApiResponseWithSocketIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  },
};

const { User, Message } = Models;
const users = new Map<string, string>();
const ioHandler = async (req: NextApiRequest, res: NextApiResponseWithSocketIO) => {
  if (!res.socket.server.io) {
    await connectDB();

    const io = new SocketIOServer(res.socket.server as any, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket: CustomSocket) => {
      console.log("A user connected");

      socket.on("subscribe", async (username: string) => {
        users.set(username, socket.id);
        socket.username = username;

        // Set the user's status to active
        await setStatus(username, "active");

        // Join the public room
        socket.join("PUBLIC_ROOM");

        // Broadcast to others in the room that a new user has joined
        socket.broadcast.to("PUBLIC_ROOM").emit("PUBLIC_ROOM", {
          message: `${username} has joined.`,
          from: "System",
          time: new Date().toISOString(),
          type: "public",
        });
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

          // Save the private message to the database
          await saveMessage({
            message,
            senderName,
            receiver: to,
            type: "private",
          });
        } else {
          console.error(`Recipient not found: ${to}`);
        }
      });


      socket.on("PUBLIC_ROOM", async ({ message, from }: MessagePayload) => {
        const formattedMessage = {
          senderName: from,
          message,
          type: "public",
          time: new Date().toISOString(),
        };

        await saveMessage({
          message,
          senderName: from,
          type: "public",
        });

        io.emit("PUBLIC_ROOM", formattedMessage);
      });

      socket.on("disconnect", async () => {
        console.log("A user disconnected");
        const username = socket.username;
        if (username) {
          await setStatus(username, "inactive");
        }
      });
    });


    res.socket.server.io = io;
  }

  res.end();
};

async function setStatus(username: string, status: "active" | "inactive") {
  try {
    const user = await User.findOne({ username });
    if (user) {
      user.status = status;
      await user.save();
      console.log(`User status updated: ${username} is now ${status}`);
    } else {
      console.error(`User not found: ${username}`);
    }
  } catch (error: any) {
    console.error(`Error updating status for ${username}: ${error.message}`);
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

    let receiverId = null;
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


export default ioHandler;
