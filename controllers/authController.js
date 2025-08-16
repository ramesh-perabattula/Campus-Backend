const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { email, password, name, studentId } = req.body;
    if (!email || !password || !name || !studentId) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        missingFields: {
          email: !email,
          password: !password,
          name: !name,
          studentId: !studentId
        }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        errors: { email: 'Please enter a valid email address' }
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Invalid password',
        errors: { password: 'Password must be at least 6 characters long' }
      });
    }
    if (name.length < 2) {
      return res.status(400).json({
        message: 'Invalid name',
        errors: { name: 'Name must be at least 2 characters long' }
      });
    }
    if (studentId.length < 3) {
      return res.status(400).json({
        message: 'Invalid student ID',
        errors: { studentId: 'Student ID must be at least 3 characters long' }
      });
    }
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          message: 'An account with this email already exists',
          errors: { email: 'This email is already registered' }
        });
      }
      if (existingUser.studentId === studentId) {
        return res.status(400).json({ 
          message: 'An account with this student ID already exists',
          errors: { studentId: 'This student ID is already registered' }
        });
      }
    }
    const user = new User({
      email,
      password,
      name,
      studentId
    });
    await user.save();
    const token = jwt.sign(
      { 
        _id: user._id,
        email: user.email,
        name: user.name,
        studentId: user.studentId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `An account with this ${field} already exists`,
        errors: { [field]: `This ${field} is already registered` }
      });
    }
    res.status(500).json({ message: 'Error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { 
        _id: user._id,
        email: user.email,
        name: user.name,
        studentId: user.studentId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting current user' });
  }
};

exports.totalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error getting total users count' });
  }
}; 