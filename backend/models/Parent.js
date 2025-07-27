const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  sixDigitCode: {
    type: String,
    required: true,
    length: 6,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: 'Six digit code must be exactly 6 digits'
    }
  },
  profileImage: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['parent', 'admin'],
    default: 'parent'
  },
  isActive: {
    type: Boolean,
    default: true
  },

}, {
  timestamps: true
});

// Virtual field for children profiles
userSchema.virtual('childrenProfiles', {
  ref: 'ChildProfile',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Method to get children profiles with basic info
userSchema.methods.getChildrenProfiles = async function() {
  const ChildProfile = require('./Child');
  const children = await ChildProfile.find({ 
    parent: this._id, 
    isActive: true 
  }).select('name dateOfBirth gender avatar createdAt');
  
  return children.map(child => ({
    _id: child._id,
    name: child.name,
    dateOfBirth: child.dateOfBirth,
    gender: child.gender,
    avatar: child.avatar,
    createdAt: child.createdAt,
    age: child.age // This will use the virtual age field
  }));
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema); 