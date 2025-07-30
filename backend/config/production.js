module.exports = {
  NODE_ENV: 'production',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/kidstube',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-here',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://kidstubepe.andrew.cmu.edu',
  BACKEND_URL: process.env.BACKEND_URL || 'http://kidstubepe.andrew.cmu.edu:5000',
  
  // File Upload Settings
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '100MB',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // CORS Settings
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://kidstubepe.andrew.cmu.edu,https://kidstubepe.andrew.cmu.edu'
}; 