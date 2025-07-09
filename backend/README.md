# KidsTube Backend

A secure video-sharing platform backend designed for parents to manage child-appropriate content.

## Features

- **Parent Authentication**: Secure user registration and login with JWT tokens
- **Child Profile Management**: Parents can create multiple child profiles with age-appropriate content filtering
- **Video Upload & Management**: Upload, categorize, and manage videos with age ranges
- **Parent Approval System**: Request and approve videos for each child profile
- **Content Filtering**: Age-based content filtering and categorization
- **Video Streaming**: Efficient video streaming with range requests
- **Social Features**: Like, comment, and interact with videos

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `PORT`: Server port (default: 5000)

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new parent account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/change-password` - Change password

### Child Profiles
- `GET /api/children` - Get all child profiles for parent
- `POST /api/children` - Create a new child profile
- `GET /api/children/:id` - Get specific child profile
- `PUT /api/children/:id` - Update child profile
- `DELETE /api/children/:id` - Delete child profile
- `POST /api/children/:id/request-video` - Request video for child
- `PUT /api/children/:id/approve-video/:videoId` - Approve/reject video request
- `DELETE /api/children/:id/approved-video/:videoId` - Remove from approved list

### Videos
- `POST /api/videos/upload` - Upload a new video
- `GET /api/videos` - Get all approved videos (public feed)
- `GET /api/videos/my-videos` - Get user's uploaded videos
- `GET /api/videos/:id` - Get specific video details
- `GET /api/videos/stream/:filename` - Stream video file
- `PUT /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/like` - Like/unlike video
- `POST /api/videos/:id/comments` - Add comment to video

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

## Data Models

### User (Parent)
- `username`, `email`, `password`
- `firstName`, `lastName`
- `role` (parent/admin)
- `isActive`

### Child Profile
- `name`, `dateOfBirth`, `gender`
- `parent` (reference to User)
- `requestedVideos` (array with status tracking)
- `approvedVideos` (array of approved videos)
- `isActive`

### Video
- `title`, `description`, `filename`
- `uploader` (reference to User)
- `category`, `ageRange`, `tags`
- `isApproved`, `isPublic`, `isActive`
- `views`, `likes`, `comments`

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- File upload validation
- Input sanitization and validation
- Soft deletes for data integrity

## File Upload

- Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- Maximum file size: 100MB
- Files stored in `./uploads` directory
- Unique filename generation to prevent conflicts

## Error Handling

- Comprehensive error handling with meaningful messages
- HTTP status codes for different error types
- Validation errors for invalid input
- File cleanup on upload errors

## Development

### Adding New Features
1. Create/update models in `models/` directory
2. Add routes in `routes/` directory
3. Update middleware if needed
4. Test endpoints with appropriate tools

### Database Migrations
- Models use Mongoose schemas with automatic validation
- Indexes are defined for performance optimization
- Virtual fields for computed properties

## Production Considerations

- Use environment variables for sensitive data
- Set up proper MongoDB authentication
- Use a strong JWT secret
- Consider using cloud storage for videos
- Implement rate limiting
- Set up proper logging
- Use HTTPS in production
- Regular database backups

## License

This project is part of the KidsTube platform. 