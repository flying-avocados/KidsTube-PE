const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Parent');
const Child = require('../models/Child');
const { auth } = require('../middleware/ageCheck');
const imageUpload = require('../middleware/imageUpload');

const router = express.Router();

// Register a new user (parent)
router.post('/register', imageUpload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, sixDigitCode } = req.body;

    // Validate six digit code
    if (!sixDigitCode || !/^\d{6}$/.test(sixDigitCode)) {
      return res.status(400).json({
        message: 'Six digit code must be exactly 6 digits'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const userData = {
      username,
      email,
      password,
      firstName,
      lastName,
      sixDigitCode
    };

    // Add profile image if uploaded
    if (req.file) {
      userData.profileImage = req.file.filename;
    }

    const user = new User(userData);

    await user.save();

    // Get children profiles for parent (will be empty for new users)
    const childrenProfiles = await user.getChildrenProfiles();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        userType: 'parent' // Registration creates parent accounts
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        ...user.toJSON(),
        userType: 'parent', // Registration creates parent accounts
        childrenProfiles
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Login user (legacy route - kept for backward compatibility)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Get children profiles for parent
    let childrenProfiles = [];
    if (user.userType === 'parent' || user.role === 'parent') {
      childrenProfiles = await user.getChildrenProfiles();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        userType: 'parent' // Legacy login defaults to parent
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...user.toJSON(),
        userType: 'parent', // Legacy login defaults to parent
        childrenProfiles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
});

// Child login - uses parent's email and password
router.post('/login/child', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find parent by email
    const parent = await User.findOne({ email, isActive: true });

    if (!parent) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await parent.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Find child profiles for this parent
    const children = await Child.find({ parent: parent._id });

    if (children.length === 0) {
      return res.status(400).json({
        message: 'No child profiles found for this account'
      });
    }

    // Generate JWT token for child access
    const token = jwt.sign(
      { 
        userId: parent._id, 
        userType: 'child',
        parentId: parent._id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Child login successful',
      token,
      user: {
        ...parent.toJSON(),
        userType: 'child',
        children: children
      }
    });
  } catch (error) {
    console.error('Child login error:', error);
    res.status(500).json({
      message: 'Error logging in as child',
      error: error.message
    });
  }
});

// Parent login - requires email, password, and six digit code
router.post('/login/parent', async (req, res) => {
  try {
    const { email, password, sixDigitCode } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check six digit code
    if (user.sixDigitCode !== sixDigitCode) {
      return res.status(401).json({
        message: 'Invalid six digit code'
      });
    }

    // Get children profiles for parent
    let childrenProfiles = [];
    if (user.userType === 'parent' || user.role === 'parent') {
      childrenProfiles = await user.getChildrenProfiles();
    }

    // Generate JWT token for parent access
    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: 'parent' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Parent login successful',
      token,
      user: {
        ...user.toJSON(),
        userType: 'parent',
        childrenProfiles
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      message: 'Error logging in as parent',
      error: error.message
    });
  }
});


// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get children profiles if user is a parent
    let childrenProfiles = [];
    if (user.userType === 'parent' || user.role === 'parent') {
      childrenProfiles = await user.getChildrenProfiles();
    }

    res.json({
      user: {
        ...user.toJSON(),
        childrenProfiles
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    console.log('request user broken');
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Error changing password',
      error: error.message
    });
  }
});

module.exports = router; 