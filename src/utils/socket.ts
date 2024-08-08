// src/utils/socket.ts
import { io } from 'socket.io-client';

console.log('Connecting to', process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
  withCredentials: true, // Ensure CORS works properly
});

socket.on('connect', () => {
  console.log('Socket connected');
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
});

export default socket;
