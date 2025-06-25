const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content: content.trim()
    });
    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email');
    const io = req.app.get('io');
    io.to(`post_${postId}`).emit('newComment', populatedComment);
    res.status(201).json(populatedComment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error adding comment' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    const postId = comment.post;
    await comment.deleteOne();
    const io = req.app.get('io');
    io.to(`post_${postId}`).emit('commentDeleted', req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
}; 