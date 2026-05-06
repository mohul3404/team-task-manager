const { Server } = require('socket.io');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('join:project', (projectId) => socket.join(`project:${projectId}`));
    socket.on('leave:project', (projectId) => socket.leave(`project:${projectId}`));
    socket.on('join:user', (userId) => socket.join(`user:${userId}`));
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
