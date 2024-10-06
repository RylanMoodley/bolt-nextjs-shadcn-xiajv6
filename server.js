const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Generate a unique ID for the peer
  const peerId = Math.random().toString(36).substr(2, 9);
  socket.emit('peer-id', peerId);

  socket.on('offer', ({ peerId, offer }) => {
    console.log(`Received offer for peer ${peerId}`);
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    console.log('Received answer');
    socket.broadcast.emit('answer', answer);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});