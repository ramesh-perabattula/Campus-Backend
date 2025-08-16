const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { setupSocket } = require('./utils/socket');

dotenv.config();

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const { scheduleCleanup } = require('./tasks/cleanupPosts');

const app = express();
const httpServer = createServer(app);

const io = setupSocket(httpServer);
app.set('io', io);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    scheduleCleanup();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Backend Status</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #000;
                color: #fff;
                font-family: 'Courier New', monospace;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                text-align: center;
            }
            .container {
                background-color: #111;
                padding: 2rem;
                border-radius: 10px;
                border: 2px solid #333;
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
            }
            .status {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #00ff00;
                text-shadow: 0 0 10px #00ff00;
            }
            .message {
                font-size: 1.2rem;
                margin-bottom: 1rem;
                color: #fff;
            }
            .timestamp {
                font-size: 0.9rem;
                color: #888;
            }
            .endpoints {
                margin-top: 2rem;
                padding: 1rem;
                background-color: #222;
                border-radius: 5px;
                text-align: left;
            }
            .endpoints h3 {
                color: #00ff00;
                margin-top: 0;
            }
            .endpoint {
                margin: 0.5rem 0;
                color: #ccc;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status">🚀 BACKEND IS RUNNING!</div>
            <div class="message">Campus Lost & Found API Server</div>
            <div class="timestamp">Started at: ${new Date().toLocaleString()}</div>
            
            <div class="endpoints">
                <h3>Available Endpoints:</h3>
                <div class="endpoint">• POST /api/auth/signup - User registration</div>
                <div class="endpoint">• POST /api/auth/login - User login</div>
                <div class="endpoint">• GET /api/auth/me - Get current user</div>
                <div class="endpoint">• GET /api/auth/total-users - Get total users count</div>
                <div class="endpoint">• GET /api/posts - Get all posts</div>
                <div class="endpoint">• POST /api/posts - Create new post</div>
                <div class="endpoint">• GET /api/comments/post/:postId - Get post comments</div>
            </div>
        </div>
    </body>
    </html>
  `;
  res.send(html);
});



const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
