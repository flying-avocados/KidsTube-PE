const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const { auth, requireRole } = require('../middleware/ageCheck');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// Upload a new video
router.post('/upload', auth, requireRole(['parent']), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No video file uploaded'
      });
    }

    const { title, description, category, ageRange, tags } = req.body;

    const video = new Video({
      title,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploader: req.user._id,
      category,
      ageRange: ageRange ? JSON.parse(ageRange) : { min: 0, max: 18 },
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await video.save();

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    console.error('Upload video error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      message: 'Error uploading video',
      error: error.message
    });
  }
});

// Get all approved videos (public feed)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, ageMin, ageMax } = req.query;
    
    const query = {
      isApproved: true,
      isPublic: true,
      isActive: true
    };

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add age range filter
    if (ageMin || ageMax) {
      query.ageRange = {};
      if (ageMin) query.ageRange.min = { $lte: parseInt(ageMin) };
      if (ageMax) query.ageRange.max = { $gte: parseInt(ageMax) };
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const videos = await Video.find(query)
      .populate('uploader', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath');

    const total = await Video.countDocuments(query);

    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      message: 'Error fetching videos',
      error: error.message
    });
  }
});

// Get videos uploaded by the authenticated user
router.get('/my-videos', auth, requireRole(['parent']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const videos = await Video.find({
      uploader: req.user._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath');

    const total = await Video.countDocuments({
      uploader: req.user._id,
      isActive: true
    });

    res.json({
      videos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({
      message: 'Error fetching your videos',
      error: error.message
    });
  }
});

// Get a specific video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('uploader', 'username firstName lastName')
      .select('-filePath');

    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      message: 'Error fetching video',
      error: error.message
    });
  }
});

// Stream video file
router.get('/stream/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const videoPath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        message: 'Video file not found'
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      message: 'Error streaming video',
      error: error.message
    });
  }
});

// Update video metadata
router.put('/:id', auth, requireRole(['parent']), async (req, res) => {
  try {
    const { title, description, category, ageRange, tags, isPublic } = req.body;

    const video = await Video.findOne({
      _id: req.params.id,
      uploader: req.user._id,
      isActive: true
    });

    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    // Update fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (ageRange) video.ageRange = JSON.parse(ageRange);
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) video.isPublic = isPublic;

    await video.save();

    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      message: 'Error updating video',
      error: error.message
    });
  }
});

// Delete video (soft delete)
router.delete('/:id', auth, requireRole(['parent']), async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      uploader: req.user._id,
      isActive: true
    });

    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    video.isActive = false;
    await video.save();

    res.json({
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      message: 'Error deleting video',
      error: error.message
    });
  }
});

// Like/unlike a video
router.post('/:id/like', auth, requireRole(['parent']), async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    const existingLike = video.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      video.likes = video.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      video.likes.push({
        user: req.user._id
      });
    }

    await video.save();

    res.json({
      message: existingLike ? 'Video unliked' : 'Video liked',
      likeCount: video.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({
      message: 'Error processing like',
      error: error.message
    });
  }
});

// Add comment to video
router.post('/:id/comments', auth, requireRole(['parent']), async (req, res) => {
  try {
    const { text } = req.body;

    const video = await Video.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!video) {
      return res.status(404).json({
        message: 'Video not found'
      });
    }

    video.comments.push({
      user: req.user._id,
      text
    });

    await video.save();

    // Populate the new comment with user info
    const newComment = video.comments[video.comments.length - 1];
    await video.populate('comments.user', 'username firstName lastName');

    res.json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      message: 'Error adding comment',
      error: error.message
    });
  }
});

module.exports = router; 