const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filename: { type: String, required: true }, // stored file name
  uploader: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subProfileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', VideoSchema); 