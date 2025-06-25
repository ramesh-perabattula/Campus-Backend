const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');

// Get all posts
router.get('/', auth, postController.getAllPosts);

// Create a new post
router.post('/', auth, postController.createPost);

// Like a post
router.post('/:postId/like', auth, postController.likePost);

// Resolve a post
router.post('/:postId/resolve', auth, postController.resolvePost);

module.exports = router; 