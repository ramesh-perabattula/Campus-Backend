const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

router.get('/post/:postId', commentController.getComments);
router.post('/post/:postId', auth, commentController.addComment);
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router; 