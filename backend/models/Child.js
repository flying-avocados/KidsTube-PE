const mongoose = require('mongoose');

const childProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  idImage: {
    type: String,
    default: null
  },
  searchHistory: [{
    query: {
      type: String,
      required: true
    },
    searchedAt: {
      type: Date,
      default: Date.now
    },
    resultsCount: {
      type: Number,
      default: 0
    }
  }],
  watchHistory: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    watchedAt: {
      type: Date,
      default: Date.now
    },
    watchDuration: {
      type: Number, // in seconds
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  requestedVideos: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    parentResponse: {
      type: String,
      enum: ['approved', 'rejected', null],
      default: null
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }],
  approvedVideos: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    approvedAt: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for age calculation
childProfileSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
childProfileSchema.set('toJSON', { virtuals: true });
childProfileSchema.set('toObject', { virtuals: true });

// Index for efficient queries
childProfileSchema.index({ parent: 1, isActive: 1 });

module.exports = mongoose.model('ChildProfile', childProfileSchema); 