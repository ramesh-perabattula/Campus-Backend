const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || (typeof v === 'string' && v.startsWith('data:image/'));
      },
      message: 'Image must be a valid base64 image string or null'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

postSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model('Post', postSchema); 