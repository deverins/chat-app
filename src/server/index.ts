// src/server/index.ts
import http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';

// Create an Express application
const app = express();

// Create an HTTP server and attach the Express application
const server = http.createServer(app);

// Create a Socket.IO server and attach it to the HTTP server
const io = new Server(server);

// Handle Socket.IO connections
io.on('connection', (socket: Socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg: string) => {
    io.emit('chat message', msg);
  });
});

// Start the server
server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
