const express = require('express');
const ChildProfile = require('../models/Child');
const Video = require('../models/Video');
const { auth, requireRole } = require('../middleware/ageCheck');
const imageUpload = require('../middleware/imageUpload');

const router = express.Router();


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
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be either "approve" or "reject"'
      });
    }

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

    // Find the video request
    const videoRequest = childProfile.requestedVideos.find(
      request => request.video.toString() === req.params.videoId
    );

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

    // For child users, we need to find their profile
    if (req.user.userType !== 'child') {
      return res.status(403).json({
        message: 'Only child users can request videos'
      });
    }

    // Find child profiles for this parent
    const children = await ChildProfile.find({ 
      parent: req.user._id, 
      isActive: true 
    });

    if (children.length === 0) {
      return res.status(404).json({
        message: 'No child profiles found'
      });
    }

    // For now, we'll use the first child profile
    // In a more sophisticated system, you might want to let the child choose which profile
    const childProfile = children[0];

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
        message: 'Video already requested'
      });
    }

    // Add video to requested list
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