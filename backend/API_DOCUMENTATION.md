# KidsTube API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new parent account.

**Request Body:**
```json
{
  "username": "parent123",
  "email": "parent@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "parent123",
    "email": "parent@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "parent",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login User
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "parent123",
    "email": "parent@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "parent",
    "isActive": true
  }
}
```

### Get Current User
**GET** `/auth/me`

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "parent123",
    "email": "parent@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "parent",
    "isActive": true
  }
}
```

---

## Child Profile Endpoints

### Get All Child Profiles
**GET** `/children`

Get all child profiles for the authenticated parent.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Emma",
    "dateOfBirth": "2018-05-15T00:00:00.000Z",
    "gender": "female",
    "age": 6,
    "parent": "60f7b3b3b3b3b3b3b3b3b3b3",
    "requestedVideos": [
      {
        "video": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
          "title": "Educational Video",
          "thumbnail": "thumbnail.jpg",
          "duration": 300
        },
        "status": "pending",
        "requestedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "approvedVideos": [],
    "isActive": true
  }
]
```

### Create Child Profile
**POST** `/children`

Create a new child profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Emma",
  "dateOfBirth": "2018-05-15",
  "gender": "female"
}
```

**Response:**
```json
{
  "message": "Child profile created successfully",
  "childProfile": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Emma",
    "dateOfBirth": "2018-05-15T00:00:00.000Z",
    "gender": "female",
    "age": 6,
    "parent": "60f7b3b3b3b3b3b3b3b3b3b3",
    "requestedVideos": [],
    "approvedVideos": [],
    "isActive": true
  }
}
```

### Request Video for Child
**POST** `/children/:childId/request-video`

Request a video for a specific child.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "videoId": "60f7b3b3b3b3b3b3b3b3b3b5"
}
```

**Response:**
```json
{
  "message": "Video requested successfully",
  "childProfile": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Emma",
    "requestedVideos": [
      {
        "video": "60f7b3b3b3b3b3b3b3b3b3b5",
        "status": "pending",
        "requestedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Approve/Reject Video Request
**PUT** `/children/:childId/approve-video/:videoId`

Approve or reject a video request for a child.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "action": "approve"
}
```

**Response:**
```json
{
  "message": "Video approved successfully",
  "childProfile": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Emma",
    "requestedVideos": [
      {
        "video": "60f7b3b3b3b3b3b3b3b3b3b5",
        "status": "approved",
        "parentResponse": "approved",
        "respondedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "approvedVideos": [
      {
        "video": "60f7b3b3b3b3b3b3b3b3b3b5",
        "approvedAt": "2024-01-01T00:00:00.000Z",
        "approvedBy": "60f7b3b3b3b3b3b3b3b3b3b3"
      }
    ]
  }
}
```

---

## Video Endpoints

### Upload Video
**POST** `/videos/upload`

Upload a new video file.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `video`: Video file (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- `title`: Video title
- `description`: Video description
- `category`: Video category (educational, entertainment, music, story, art, science, other)
- `ageRange`: JSON string for age range (e.g., `{"min": 3, "max": 8}`)
- `tags`: Comma-separated tags

**Response:**
```json
{
  "message": "Video uploaded successfully",
  "video": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "title": "Educational Video",
    "description": "A fun educational video for kids",
    "filename": "1234567890-video.mp4",
    "originalName": "video.mp4",
    "fileSize": 52428800,
    "uploader": "60f7b3b3b3b3b3b3b3b3b3b3",
    "category": "educational",
    "ageRange": {
      "min": 3,
      "max": 8
    },
    "tags": ["education", "fun", "learning"],
    "isPublic": true,
    "isApproved": false,
    "views": 0,
    "likeCount": 0,
    "commentCount": 0,
    "isActive": true
  }
}
```

### Get All Videos (Public Feed)
**GET** `/videos`

Get all approved videos for public viewing.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `search`: Search in title, description, or tags
- `ageMin`: Minimum age filter
- `ageMax`: Maximum age filter

**Response:**
```json
{
  "videos": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "title": "Educational Video",
      "description": "A fun educational video for kids",
      "thumbnail": "thumbnail.jpg",
      "duration": 300,
      "uploader": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "parent123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "category": "educational",
      "ageRange": {
        "min": 3,
        "max": 8
      },
      "tags": ["education", "fun", "learning"],
      "views": 150,
      "likeCount": 25,
      "commentCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

### Get My Videos
**GET** `/videos/my-videos`

Get videos uploaded by the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "videos": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "title": "Educational Video",
      "description": "A fun educational video for kids",
      "thumbnail": "thumbnail.jpg",
      "duration": 300,
      "category": "educational",
      "ageRange": {
        "min": 3,
        "max": 8
      },
      "tags": ["education", "fun", "learning"],
      "isPublic": true,
      "isApproved": false,
      "views": 150,
      "likeCount": 25,
      "commentCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 15
}
```

### Stream Video
**GET** `/videos/stream/:filename`

Stream a video file with range request support.

**Response:**
Video file stream with appropriate headers for range requests.

### Like/Unlike Video
**POST** `/videos/:videoId/like`

Like or unlike a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Video liked",
  "likeCount": 26,
  "isLiked": true
}
```

### Add Comment
**POST** `/videos/:videoId/comments`

Add a comment to a video.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Great educational content!"
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "parent123",
      "firstName": "John",
      "lastName": "Doe"
    },
    "text": "Great educational content!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## User Management Endpoints

### Get User Statistics
**GET** `/users/stats`

Get statistics for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "videoCount": 15,
  "childCount": 2,
  "totalViews": 2500
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "message": "Validation failed",
  "error": "Date of birth must be in the past"
}
```

### Authentication Error (401)
```json
{
  "message": "Access denied. No token provided."
}
```

### Authorization Error (403)
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### Not Found Error (404)
```json
{
  "message": "Video not found"
}
```

### Server Error (500)
```json
{
  "message": "Error uploading video",
  "error": "Internal server error details"
}
```

---

## File Upload Guidelines

### Supported Formats
- MP4
- AVI
- MOV
- WMV
- FLV
- WebM
- MKV

### File Size Limits
- Maximum: 100MB per file

### Upload Process
1. Use multipart/form-data
2. Include video file in 'video' field
3. Include metadata in form fields
4. Server validates file type and size
5. File is saved with unique filename
6. Video metadata is stored in database

---

## Rate Limiting & Security

- JWT tokens expire after 7 days
- File uploads are validated for type and size
- Input is sanitized and validated
- Soft deletes maintain data integrity
- Role-based access control for admin functions 