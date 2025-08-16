const { Server } = require('socket.io');

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinPost', (postId) => {
      socket.join(`post_${postId}`);
    });
    
    socket.on('leavePost', (postId) => {
      socket.leave(`post_${postId}`);
    });
    
    socket.on('disconnect', () => {});
  });

  return io;
};

module.exports = { setupSocket };
