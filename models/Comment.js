const mongoose = require('mongoose');

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
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const author = await User.findById(this.author);
      if (!author) {
        throw new Error('Author not found');
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Pre-find middleware to always populate author
commentSchema.pre('find', function() {
  if (!this._mongooseOptions.populate) {
    this.populate('author', 'name email');
  }
});

commentSchema.pre('findOne', function() {
  if (!this._mongooseOptions.populate) {
    this.populate('author', 'name email');
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 