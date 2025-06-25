const mongoose = require('mongoose');
const User = require('./User');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure author exists
commentSchema.pre('save', async function(next) {
  const user = await User.findById(this.author);
  if (!user) {
    return next(new Error('Author does not exist'));
  }
  next();
});

// Pre-find middleware to always populate author
commentSchema.pre(/^find/, function(next) {
  this.populate('author', 'name email');
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 