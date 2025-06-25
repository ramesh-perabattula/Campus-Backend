const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Test users data
const testUsers = [
  {
    email: "john.doe@university.edu",
    password: "password123",
    name: "John Doe",
    studentId: "STU2024001",
    createdAt: new Date("2024-01-15T08:30:00Z")
  },
  {
    email: "sarah.chen@university.edu",
    password: "securepass456",
    name: "Sarah Chen",
    studentId: "STU2024002",
    createdAt: new Date("2024-01-16T09:15:00Z")
  },
  {
    email: "michael.wilson@university.edu",
    password: "mike2024pass",
    name: "Michael Wilson",
    studentId: "STU2024003",
    createdAt: new Date("2024-01-17T10:45:00Z")
  },
  {
    email: "emma.rodriguez@university.edu",
    password: "emma2024!",
    name: "Emma Rodriguez",
    studentId: "STU2024004",
    createdAt: new Date("2024-01-18T11:20:00Z")
  },
  {
    email: "alex.kumar@university.edu",
    password: "alex2024pass",
    name: "Alex Kumar",
    studentId: "STU2024005",
    createdAt: new Date("2024-01-19T13:10:00Z")
  }
];

// Function to create users
async function createTestUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create new users (password will be hashed by the User model's pre-save hook)
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.email}`);
    }

    console.log('All test users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

// Run the script
createTestUsers(); 