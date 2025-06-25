const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const { scheduleCleanup } = require('./tasks/cleanupPosts');
dotenv.config();
console.log("Connecting to MongoDB URI:", process.env.MONGODB_URI);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
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
app.set('io', io);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    scheduleCleanup();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentRoutes);
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url,
    method: req.method,
    availableRoutes: [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/posts',
      '/api/comments/post/:postId'
    ]
  });
});
app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: err.message
    });
  }
  if (err.name === 'StrictPopulateError') {
    return res.status(500).json({
      message: 'Error populating data',
      error: err.message
    });
  }
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    type: err.name
  });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
