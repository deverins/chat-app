//

const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  const users: string[] = [];
  let roomName = "";
  io.on("connection", (socket: any) => {
    console.log("New client connected");

    socket.emit("connection", "connected");

    socket.on("message", (message: any) => {
      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });

    socket.on("userName", (name: string) => {
      console.log({name});
      
      if (!users.includes(name) && users.length < 2) users.push(name);

      if (users.length == 2) {
        console.log({users});
        
        roomName = users.toSorted((a, b) => (a > b ? -1 : 1)).join("-");
        io.emit("roomName", roomName);

        socket.on(roomName, (message: any) => {
          console.log({message}, "From room", roomName);
          
          io.emit(roomName, message);
        });
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
