const mongoose = require('mongoose');

const SubProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String }, // URL or path to avatar image
  createdAt: { type: Date, default: Date.now },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subProfiles: [SubProfileSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema); 