const express = require('express');
const User = require('../models/Parent');
const { auth, requireRole } = require('../middleware/ageCheck');

const router = express.Router();


// Get user profile with children (for parents)
router.get('/profile', auth, async (req, res) => {
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
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    const user = await User.findById(req.user._id);

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email is already taken'
        });
      }
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    // Get children profiles if user is a parent
    let childrenProfiles = [];
    if (user.userType === 'parent' || user.role === 'parent') {
      childrenProfiles = await user.getChildrenProfiles();
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...user.toJSON(),
        childrenProfiles
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', auth, requireRole(['parent']), async (req, res) => {
  try {
    const Video = require('../models/Video');
    const ChildProfile = require('../models/Child');

    const [videoCount, childCount, totalViews] = await Promise.all([
      Video.countDocuments({ uploader: req.user._id, isActive: true }),
      ChildProfile.countDocuments({ parent: req.user._id, isActive: true }),
      Video.aggregate([
        { $match: { uploader: req.user._id, isActive: true } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    ]);

    res.json({
      videoCount,
      childCount,
      totalViews: totalViews[0]?.totalViews || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Admin: Get all users (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Admin: Update user role
router.put('/:id/role', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['parent', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      message: 'Error updating user role',
      error: error.message
    });
  }
});

// Admin: Deactivate user
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

module.exports = router; 