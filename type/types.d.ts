import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';

declare module 'http' {
  interface Server {
    io?: ServerIO;
  }
}
