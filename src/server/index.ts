import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.emit("connection", "connected");

    socket.on('message', (message) => {
      io.emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.use(express.json());

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});




// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import next from 'next';

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();
//   const httpServer = createServer(server);
//   const io = new Server(httpServer);

//   io.on('connection', (socket) => {
//     console.log('New client connected');

//     socket.emit("connection", "connected")

//     socket.on('message', (message) => {
//       io.emit('message', message);
//     });

//     socket.on('disconnect', () => {
//       console.log('Client disconnected');
//     });
//   });

//   server.all('*', (req, res) => {
//     return handle(req, res);
//   });

//   const port = process.env.PORT || 3000;
//   httpServer.listen(port, (err?: any) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${port}`);
//   });
// });
