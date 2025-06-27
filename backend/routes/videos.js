const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Upload video
router.post('/upload', auth, upload.single('video'), async (req, res) => {
  const { title, description, subProfileId } = req.body;
  if (!title || !subProfileId || !req.file) return res.status(400).json({ message: 'Missing fields' });
  // Check sub-profile belongs to user
  const user = await User.findById(req.userId);
  if (!user || !user.subProfiles.id(subProfileId)) return res.status(400).json({ message: 'Invalid sub-profile' });
  const video = new Video({
    title,
    description,
    filename: req.file.filename,
    uploader: { userId: req.userId, subProfileId },
  });
  await video.save();
  res.status(201).json(video);
});

// List videos
router.get('/', async (req, res) => {
  const videos = await Video.find().sort({ uploadDate: -1 });
  res.json(videos);
});

// Stream video
router.get('/stream/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

module.exports = router; 