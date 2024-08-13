// src/server/index.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import User from '../../models/user.model';

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

  // Middleware to parse JSON requests - Applied once
  server.use(express.json());

  // Add the /api/user route
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

  // Handle all other routes with Next.js
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
