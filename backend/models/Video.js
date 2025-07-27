const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  thumbnail: {
    type: String,
    default: null
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['educational', 'entertainment', 'music', 'story', 'art', 'science', 'other'],
    default: 'other'
  },
  ageRange: {
    min: {
      type: Number,
      min: 0,
      max: 18,
      default: 0
    },
    max: {
      type: Number,
      min: 0,
      max: 18,
      default: 18
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
videoSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Ensure virtual fields are serialized
videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

// Indexes for efficient queries
videoSchema.index({ uploader: 1, isActive: 1 });
videoSchema.index({ isApproved: 1, isPublic: 1, isActive: 1 });
videoSchema.index({ category: 1, isApproved: 1, isActive: 1 });
videoSchema.index({ tags: 1, isApproved: 1, isActive: 1 });

module.exports = mongoose.model('Video', videoSchema); 