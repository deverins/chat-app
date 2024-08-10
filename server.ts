const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const next = require("next");
const mongoose = require("mongoose");
const UserModel = require("./models/user.model")(mongoose);


const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "your-mongodb-connection-string";

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  const users: string[] = [];

  connectDB();

  io.on("connection", async (socket: any) => {
    console.log("New client connected");

    socket.emit("connection", "connected");

    socket.on("userName", async (name: string) => {
      console.log({ name });

      let user = await UserModel.findOne({ username: name });

      if (!user) {
        user = new UserModel({ username: name, status: "active" });
      } else {
        user.status = "active";
      }
      await user.save();

      if (!users.includes(name) && users.length < 2) users.push(name);

      if (users.length == 2) {
        console.log({ users });

        const roomName = users.sort((a, b) => (a > b ? -1 : 1)).join("-");
        io.emit("roomName", roomName);

        socket.on(roomName, async (message: any) => {
          console.log({ message }, "From room", roomName);

          const recipient = await UserModel.findOne({ username: message.to });
          if (recipient && recipient.status === "active") {
            io.emit(roomName, message);
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
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log("Client disconnected");

      const user = await UserModel.findOne({ username: socket.username }); 
      if (user) {
        user.status = "inactive";
        await user.save();
      }
    });
  });

  server.all("*", (req: any, res: any) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});


//server.ts
// const express = require("express");
// const { Server } = require("socket.io");
// const { createServer } = require("http");
// const next = require("next");
// const mongoose = require("mongoose");

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// const connectDB = async () => {
//   try {
//     const mongoUri =
//       process.env.MONGODB_URI || "your-mongodb-connection-string";

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
//   let roomName = "";

//   connectDB()

//   io.on("connection", (socket: any) => {
//     console.log("New client connected");

//     socket.emit("connection", "connected");

//     socket.on("message", (message: any) => {
//       io.emit("message", message);
//     });

//     socket.on("disconnect", () => {
//       console.log("Client disconnected");
//     });

//     socket.on("userName", (name: string) => {
//       console.log({name});

//       if (!users.includes(name) && users.length < 2) users.push(name);

//       if (users.length == 2) {
//         console.log({users});

//         roomName = users.toSorted((a, b) => (a > b ? -1 : 1)).join("-");
//         io.emit("roomName", roomName);

//         socket.on(roomName, (message: any) => {
//           console.log({message}, "From room", roomName);

//           io.emit(roomName, message);
//         });
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
