const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('../models/Post');
const User = require('../models/User');

dotenv.config();

const testPosts = [
  {
    type: 'lost',
    title: 'Lost iPhone 13',
    description: 'Lost my iPhone 13 in the library yesterday. It has a black case with a red stripe.',
    category: 'Electronics',
    location: 'Main Library',
    status: 'open',
    createdAt: new Date('2024-03-15T10:00:00Z')
  },
  {
    type: 'found',
    title: 'Found Blue Backpack',
    description: 'Found a blue Jansport backpack in the cafeteria. Contains textbooks and notebooks.',
    category: 'Accessories',
    location: 'Student Center Cafeteria',
    status: 'open',
    createdAt: new Date('2024-03-14T15:30:00Z')
  },
  {
    type: 'lost',
    title: 'Lost Calculator',
    description: 'Lost my TI-84 calculator during math class. It has a sticker on the back.',
    category: 'Electronics',
    location: 'Math Building Room 101',
    status: 'open',
    createdAt: new Date('2024-03-13T09:15:00Z')
  },
  {
    type: 'found',
    title: 'Found Student ID Card',
    description: 'Found a student ID card near the gym entrance.',
    category: 'Documents',
    location: 'Sports Complex',
    status: 'open',
    createdAt: new Date('2024-03-12T14:45:00Z')
  },
  {
    type: 'lost',
    title: 'Lost Water Bottle',
    description: 'Lost my Hydroflask water bottle. It\'s black with a white cap.',
    category: 'Accessories',
    location: 'Engineering Building',
    status: 'open',
    createdAt: new Date('2024-03-11T11:20:00Z')
  }
];

const createTestPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a test user to be the author
    const testUser = await User.findOne({ email: 'john.doe@example.com' });
    if (!testUser) {
      console.error('Test user not found. Please run createTestUsers.js first.');
      process.exit(1);
    }

    // Clear existing posts
    await Post.deleteMany({});
    console.log('Cleared existing posts');

    // Create new posts
    for (const postData of testPosts) {
      const post = new Post({
        ...postData,
        author: testUser._id,
        authorName: testUser.name,
        likes: [],
        replies: []
      });
      await post.save();
      console.log(`Created post: ${post.title}`);
    }

    console.log('Test posts created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test posts:', error);
    process.exit(1);
  }
};

createTestPosts(); 