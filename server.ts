// sever.ts
import express from 'express';
import { createServer } from 'http';
import next from 'next';
import User from './models/user.model'; 
import { Server, Socket } from 'socket.io';
import 'dotenv/config';
import connectDB from './src/lib/mongodbConnection';

declare module 'socket.io' {
  interface Socket {
    username?: string;
  }
}

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  server.use(express.json());

  connectDB();

  server.post('/api/user', async (req, res) => {
    const { username } = req.body;
    try {
      const user = await User.findOne({ username });
      res.json({ exists: !!user });
    } catch (error) {
      console.error('Error checking username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('New client connected');

    socket.on('userName', async (name: string) => {
      console.log({ name });

      let user = await User.findOne({ username: name });

      if (!user) {
        user = new User({ username: name, status: 'active' });
      } else {
        user.status = 'active';
      }
      await user.save();

      socket.username = name;
      socket.emit('userInfo', user);

      const users = [...io.sockets.sockets.values()]
        .map(s => s.username)
        .filter(Boolean) as string[];

      if (!users.includes(name) && users.length < 2) users.push(name);

      if (users.length === 2) {
        const roomName = users.sort().join('-');
        io.emit('roomName', roomName);

        socket.on(roomName, async (message: { to: string; text: string }) => {
          try {
            const recipient = await User.findOne({ username: message.to });
            if (recipient && recipient.status === 'active') {
              io.to(roomName).emit(roomName, message);
            } else {
              if (recipient) {
                recipient.messages.push({
                  from: name,
                  message: message.text,
                  timestamp: new Date(),
                });
                await recipient.save();
              }
            }
          } catch (error) {
            console.error('Error sending message:', error);
          }
        });
      }
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected');

      const user = await User.findOne({ username: socket.username });
      if (user) {
        user.status = 'inactive';
        await user.save();
      }
    });
  });

  server.all('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});





// const express = require("express");
// const { Server } = require("socket.io");
// const { createServer } = require("http");
// const next = require("next");
// const mongoose = require("mongoose");
// const UserModel = require("./models/user.model")(mongoose);


// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// const connectDB = async () => {
//   try {
//     const mongoUri = process.env.MONGODB_URI || "your-mongodb-connection-string";

//     await mongoose.connect(mongoUri);

//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//     process.exit(1);
//   }
// };

// app.prepare().then(() => {
//   const server = express();
//   const httpServer = createServer(server);
//   const io = new Server(httpServer);

//   const users: string[] = [];

//   connectDB();

//   io.on("connection", async (socket: any) => {
//     console.log("New client connected");

//     socket.emit("connection", "connected");

//     socket.on("userName", async (name: string) => {
//       console.log({ name });

//       let user = await UserModel.findOne({ username: name });

//       if (!user) {
//         user = new UserModel({ username: name, status: "active" });
//       } else {
//         user.status = "active";
//       }
//       await user.save();

//       if (!users.includes(name) && users.length < 2) users.push(name);

//       if (users.length == 2) {
//         console.log({ users });

//         const roomName = users.sort((a, b) => (a > b ? -1 : 1)).join("-");
//         io.emit("roomName", roomName);

//         socket.on(roomName, async (message: any) => {
//           console.log({ message }, "From room", roomName);

//           const recipient = await UserModel.findOne({ username: message.to });
//           if (recipient && recipient.status === "active") {
//             io.emit(roomName, message);
//           } else {
//             if (recipient) {
//               recipient.messages.push({
//                 from: name,
//                 message: message.text,
//                 timestamp: new Date(),
//               });
//               await recipient.save();
//             }
//           }
//         });
//       }
//     });

//     socket.on("disconnect", async () => {
//       console.log("Client disconnected");

//       const user = await UserModel.findOne({ username: socket.username });
//       if (user) {
//         user.status = "inactive";
//         await user.save();
//       }
//     });
//   });

//   server.all("*", (req: any, res: any) => {
//     return handle(req, res);
//   });

//   const port = process.env.PORT || 3000;
//   httpServer.listen(port, (err?: any) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${port}`);
//   });
// });
