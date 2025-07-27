const express = require('express');
const ChildProfile = require('../models/Child');
const Video = require('../models/Video');
const { auth, requireRole } = require('../middleware/ageCheck');
const imageUpload = require('../middleware/imageUpload');

const router = express.Router();

// Get approved videos (for child users) - MUST BE BEFORE /:id route
router.get('/approved-videos', auth, async (req, res) => {
  try {
    console.log('Get approved videos request received:', {
      userId: req.user._id,
      userType: req.user.userType,
      email: req.user.email
    });

    // Validate user type - this route is for child users
    if (req.user.userType !== 'child') {
      console.log('Invalid user type for approved videos route:', req.user.userType);
      return res.status(403).json({
        message: 'This endpoint is only available for child users'
      });
    }

    // Find all child profiles for this parent
    const childProfiles = await ChildProfile.find({
      parent: req.user._id,
      isActive: true
    }).populate('approvedVideos.video');

    console.log('Child profiles found:', childProfiles.length);

    if (childProfiles.length === 0) {
      console.log('No child profiles found for parent:', req.user._id);
      return res.status(404).json({
        message: 'No child profiles found for this account'
      });
    }

    // Combine all approved videos from all child profiles
    const allApprovedVideos = [];
    childProfiles.forEach(childProfile => {
      console.log(`Child profile ${childProfile.name} has ${childProfile.approvedVideos.length} approved videos`);
      childProfile.approvedVideos.forEach(approvedVideo => {
        if (approvedVideo.video) { // Only include if video exists
          allApprovedVideos.push({
            ...approvedVideo.toObject(),
            childName: childProfile.name // Add child name for context
          });
        }
      });
    });

    console.log('Total approved videos found:', allApprovedVideos.length);

    res.json({
      approvedVideos: allApprovedVideos,
      totalCount: allApprovedVideos.length
    });
  } catch (error) {
    console.error('Get approved videos error:', error);
    res.status(500).json({
      message: 'Error fetching approved videos',
      error: error.message
    });
  }
});

// Get all child profiles for the authenticated parent
router.get('/', auth, requireRole(['parent']), async (req, res) => {
  try {
    const children = await ChildProfile.find({ 
      parent: req.user._id, 
      isActive: true 
    }).populate('requestedVideos.video', 'title thumbnail duration');
    
    res.json(children);
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      message: 'Error fetching child profiles',
      error: error.message
    });
  }
});

// Create a new child profile
router.post('/', auth, requireRole(['parent']), imageUpload.single('idImage'), async (req, res) => {
  try {
    const { name, dateOfBirth, gender } = req.body;

    // Validate date of birth
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      return res.status(400).json({
        message: 'Date of birth must be in the past'
      });
    }

    const childData = {
      name,
      dateOfBirth: birthDate,
      gender,
      parent: req.user._id
    };

    // Add ID image if uploaded
    if (req.file) {
      childData.idImage = req.file.filename;
    }

    const childProfile = new ChildProfile(childData);

    await childProfile.save();

    res.status(201).json({
      message: 'Child profile created successfully',
      childProfile
    });
  } catch (error) {
    console.error('Create child profile error:', error);
    res.status(500).json({
      message: 'Error creating child profile',
      error: error.message
    });
  }
});

// Get a specific child profile
router.get('/:id', auth, requireRole(['parent']), async (req, res) => {
  try {
    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    }).populate([
      {
        path: 'requestedVideos.video',
        select: 'title thumbnail duration description category ageRange tags'
      },
      {
        path: 'approvedVideos.video',
        select: 'title thumbnail duration description category ageRange tags'
      }
    ]);

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    res.json(childProfile);
  } catch (error) {
    console.error('Get child profile error:', error);
    res.status(500).json({
      message: 'Error fetching child profile',
      error: error.message
    });
  }
});

// Update a child profile
router.put('/:id', auth, requireRole(['parent']), imageUpload.single('idImage'), async (req, res) => {
  try {
    const { name, dateOfBirth, gender } = req.body;

    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    // Update fields
    if (name) childProfile.name = name;
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        return res.status(400).json({
          message: 'Date of birth must be in the past'
        });
      }
      childProfile.dateOfBirth = birthDate;
    }
    if (gender) childProfile.gender = gender;

    // Update ID image if uploaded
    if (req.file) {
      childProfile.idImage = req.file.filename;
    }

    await childProfile.save();

    res.json({
      message: 'Child profile updated successfully',
      childProfile
    });
  } catch (error) {
    console.error('Update child profile error:', error);
    res.status(500).json({
      message: 'Error updating child profile',
      error: error.message
    });
  }
});

// Delete a child profile (soft delete)
router.delete('/:id', auth, requireRole(['parent']), async (req, res) => {
  try {
    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    childProfile.isActive = false;
    await childProfile.save();

    res.json({
      message: 'Child profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete child profile error:', error);
    res.status(500).json({
      message: 'Error deleting child profile',
      error: error.message
    });
  }
});

// Request a video for a child (parent only)
router.post('/:id/request-video', auth, requireRole(['parent']), async (req, res) => {
  try {
    const { videoId } = req.body;

    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    // Check if video exists and is approved
    const video = await Video.findOne({
      _id: videoId,
      isApproved: true,
      isActive: true
    });

    if (!video) {
      return res.status(404).json({
        message: 'Video not found or not approved'
      });
    }

    // Check if video is already requested
    const existingRequest = childProfile.requestedVideos.find(
      request => request.video.toString() === videoId
    );

    if (existingRequest) {
      return res.status(400).json({
        message: 'Video already requested for this child'
      });
    }

    // Add video to requested list
    childProfile.requestedVideos.push({
      video: videoId,
      status: 'pending'
    });

    await childProfile.save();

    res.json({
      message: 'Video requested successfully',
      childProfile
    });
  } catch (error) {
    console.error('Request video error:', error);
    res.status(500).json({
      message: 'Error requesting video',
      error: error.message
    });
  }
});

// Approve or reject a video request
router.put('/:id/approve-video/:videoId', auth, requireRole(['parent']), async (req, res) => {
  try {
    console.log('Approve video request received:', {
      childId: req.params.id,
      videoId: req.params.videoId,
      action: req.body.action,
      userId: req.user._id
    });

    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      console.log('Invalid action:', action);
      return res.status(400).json({
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    console.log('Child profile found:', childProfile ? 'Yes' : 'No');

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    // Find the video request
    const videoRequest = childProfile.requestedVideos.find(
      request => request.video.toString() === req.params.videoId
    );

    console.log('Video request found:', videoRequest ? 'Yes' : 'No');
    console.log('Available requests:', childProfile.requestedVideos.map(r => ({
      videoId: r.video.toString(),
      status: r.status
    })));

    if (!videoRequest) {
      return res.status(404).json({
        message: 'Video request not found'
      });
    }

    if (action === 'approve') {
      // Update request status
      videoRequest.status = 'approved';
      videoRequest.parentResponse = 'approved';
      videoRequest.respondedAt = new Date();

      // Add to approved videos
      childProfile.approvedVideos.push({
        video: req.params.videoId,
        approvedBy: req.user._id
      });
    } else {
      // Update request status
      videoRequest.status = 'rejected';
      videoRequest.parentResponse = 'rejected';
      videoRequest.respondedAt = new Date();
    }

    await childProfile.save();
    console.log('Child profile saved successfully');

    res.json({
      message: `Video ${action}d successfully`,
      childProfile
    });
  } catch (error) {
    console.error('Approve video error:', error);
    res.status(500).json({
      message: 'Error processing video approval',
      error: error.message
    });
  }
});

// Child requests a video (for child users)
router.post('/request-video', auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    
    // Find the first child profile for this parent
    const childProfile = await ChildProfile.findOne({ 
      parent: req.user._id, 
      isActive: true 
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'No child profile found for this account'
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    // Check if video is already requested
    const existingRequest = childProfile.requestedVideos.find(
      request => request.video.toString() === videoId
    );

    if (existingRequest) {
      return res.status(400).json({
        message: 'Video already requested'
      });
    }

    childProfile.requestedVideos.push({
      video: videoId,
      status: 'pending',
      requestedBy: 'child'
    });
    await childProfile.save();

    res.json({
      message: 'Video requested successfully! Your parent will review it.',
      childProfile: {
        name: childProfile.name,
        requestedVideos: childProfile.requestedVideos
      }
    });
  } catch (error) {
    console.error('Child request video error:', error);
    res.status(500).json({
      message: 'Error requesting video',
      error: error.message
    });
  }
});

// Track search history (for child users)
router.post('/search-history', auth, async (req, res) => {
  try {
    const { query, resultsCount } = req.body;
    
    // Find the first child profile for this parent
    const childProfile = await ChildProfile.findOne({ 
      parent: req.user._id, 
      isActive: true 
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'No child profile found for this account'
      });
    }

    // Add search to history
    childProfile.searchHistory.push({
      query,
      resultsCount: resultsCount || 0
    });

    // Keep only last 50 searches
    if (childProfile.searchHistory.length > 50) {
      childProfile.searchHistory = childProfile.searchHistory.slice(-50);
    }

    await childProfile.save();

    res.json({
      message: 'Search history updated',
      searchHistory: childProfile.searchHistory
    });
  } catch (error) {
    console.error('Track search history error:', error);
    res.status(500).json({
      message: 'Error tracking search history',
      error: error.message
    });
  }
});

// Track watch history (for child users)
router.post('/watch-history', auth, async (req, res) => {
  try {
    const { videoId, watchDuration, completed } = req.body;
    
    // Find the first child profile for this parent
    const childProfile = await ChildProfile.findOne({ 
      parent: req.user._id, 
      isActive: true 
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'No child profile found for this account'
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    // Check if video is already in watch history
    const existingWatch = childProfile.watchHistory.find(
      watch => watch.video.toString() === videoId
    );

    if (existingWatch) {
      // Update existing watch entry
      existingWatch.watchedAt = new Date();
      existingWatch.watchDuration = watchDuration || existingWatch.watchDuration;
      existingWatch.completed = completed || existingWatch.completed;
    } else {
      // Add new watch entry
      childProfile.watchHistory.push({
        video: videoId,
        watchDuration: watchDuration || 0,
        completed: completed || false
      });
    }

    // Keep only last 100 watched videos
    if (childProfile.watchHistory.length > 100) {
      childProfile.watchHistory = childProfile.watchHistory.slice(-100);
    }

    await childProfile.save();

    res.json({
      message: 'Watch history updated',
      watchHistory: childProfile.watchHistory
    });
  } catch (error) {
    console.error('Track watch history error:', error);
    res.status(500).json({
      message: 'Error tracking watch history',
      error: error.message
    });
  }
});

// Get search and watch history (for parents)
router.get('/:id/history', auth, requireRole(['parent']), async (req, res) => {
  try {
    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    }).populate([
      {
        path: 'searchHistory',
        options: { sort: { searchedAt: -1 } }
      },
      {
        path: 'watchHistory.video',
        select: 'title thumbnail duration description category'
      }
    ]);

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    res.json({
      searchHistory: childProfile.searchHistory,
      watchHistory: childProfile.watchHistory
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      message: 'Error fetching history',
      error: error.message
    });
  }
});

// Clear search history (for parents)
router.delete('/:id/search-history', auth, requireRole(['parent']), async (req, res) => {
  try {
    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    childProfile.searchHistory = [];
    await childProfile.save();

    res.json({
      message: 'Search history cleared successfully'
    });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({
      message: 'Error clearing search history',
      error: error.message
    });
  }
});

// Clear watch history (for parents)
router.delete('/:id/watch-history', auth, requireRole(['parent']), async (req, res) => {
  try {
    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    childProfile.watchHistory = [];
    await childProfile.save();

    res.json({
      message: 'Watch history cleared successfully'
    });
  } catch (error) {
    console.error('Clear watch history error:', error);
    res.status(500).json({
      message: 'Error clearing watch history',
      error: error.message
    });
  }
});

// Remove a video from approved list
router.delete('/:id/approved-video/:videoId', auth, requireRole(['parent']), async (req, res) => {
  try {
    const childProfile = await ChildProfile.findOne({
      _id: req.params.id,
      parent: req.user._id,
      isActive: true
    });

    if (!childProfile) {
      return res.status(404).json({
        message: 'Child profile not found'
      });
    }

    // Remove from approved videos
    childProfile.approvedVideos = childProfile.approvedVideos.filter(
      approved => approved.video.toString() !== req.params.videoId
    );

    // Update request status to rejected
    const videoRequest = childProfile.requestedVideos.find(
      request => request.video.toString() === req.params.videoId
    );

    if (videoRequest) {
      videoRequest.status = 'rejected';
      videoRequest.parentResponse = 'rejected';
      videoRequest.respondedAt = new Date();
    }

    await childProfile.save();

    res.json({
      message: 'Video removed from approved list successfully',
      childProfile
    });
  } catch (error) {
    console.error('Remove approved video error:', error);
    res.status(500).json({
      message: 'Error removing approved video',
      error: error.message
    });
  }
});

module.exports = router; 