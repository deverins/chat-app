import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

// Type guard to check if the server has `io` property
function isServerWithIo(server: any): server is NetServer & { io?: ServerIO } {
  return server && typeof server === 'object' && 'io' in server;
}

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const socket = res.socket as { server?: NetServer };

  if (!socket.server) {
    res.status(500).json({ error: 'Server not available' });
    return;
  }

  const server = socket.server;

  if (!isServerWithIo(server)) {
    res.status(500).json({ error: 'Server not available or incorrect type' });
    return;
  }

  if (!server.io) {
    console.log('Initializing Socket.io');
    const io = new ServerIO(server);
    server.io = io;

    io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });

      socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });
    });
  }

  res.status(200).end();
};

export default ioHandler;
