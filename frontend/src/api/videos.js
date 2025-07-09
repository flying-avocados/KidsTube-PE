import api from './config';

export const videosAPI = {
  // Upload a new video
  upload: async (formData) => {
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all approved videos (public feed)
  getAll: async (params = {}) => {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  // Get videos uploaded by the current user
  getMyVideos: async (params = {}) => {
    const response = await api.get('/videos/my-videos', { params });
    return response.data;
  },

  // Get a specific video
  getById: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },

  // Update video metadata
  update: async (videoId, videoData) => {
    const response = await api.put(`/videos/${videoId}`, videoData);
    return response.data;
  },

  // Delete a video (soft delete)
  delete: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  },

  // Like or unlike a video
  toggleLike: async (videoId) => {
    const response = await api.post(`/videos/${videoId}/like`);
    return response.data;
  },

  // Add a comment to a video
  addComment: async (videoId, text) => {
    const response = await api.post(`/videos/${videoId}/comments`, { text });
    return response.data;
  },

  // Get video stream URL
  getStreamUrl: (filename) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${filename}`;
  }
}; 