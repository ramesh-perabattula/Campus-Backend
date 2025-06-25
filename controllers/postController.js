const Post = require('../models/Post');
const mongoose = require('mongoose');

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

exports.createPost = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { type, title, description, category, location } = req.body;
    if (!type || !title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing: {
          type: !type,
          title: !title,
          description: !description,
          category: !category,
          location: !location
        }
      });
    }
    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({
        message: 'Invalid post type',
        error: 'Type must be either "lost" or "found"'
      });
    }
    const postData = {
      type,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      author: req.user._id
    };
    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image/')) {
      const base64Data = req.body.image.split(',')[1];
      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const sizeInMB = sizeInBytes / (1024 * 1024);
      if (sizeInMB > 5) {
        return res.status(400).json({
          message: 'Image size too large',
          error: 'Image must be less than 5MB'
        });
      }
      postData.image = req.body.image;
    }
    const post = new Post(postData);
    const savedPost = await post.save();
    const populatedPost = await Post.findById(savedPost._id)
      .populate('author', 'name email studentId');
    res.status(201).json(populatedPost);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({ 
      message: 'Error creating post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      type: error.name
    });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post' });
  }
};

exports.resolvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to resolve this post' });
    }
    post.status = 'resolved';
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving post' });
  }
}; 