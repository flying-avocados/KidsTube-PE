import api from './config';

export const childrenAPI = {
  // Get all child profiles for the parent
  getAll: async () => {
    const response = await api.get('/subprofiles');
    return response.data;
  },

  // Create a new child profile
  create: async (childData) => {
    // If childData is FormData (for file uploads), don't set Content-Type
    const config = childData instanceof FormData ? {} : {};
    const response = await api.post('/subprofiles', childData, config);
    return response.data;
  },

  // Get a specific child profile
  getById: async (childId) => {
    const response = await api.get(`/subprofiles/${childId}`);
    return response.data;
  },

  // Update a child profile
  update: async (childId, childData) => {
    // If childData is FormData (for file uploads), don't set Content-Type
    const config = childData instanceof FormData ? {} : {};
    const response = await api.put(`/subprofiles/${childId}`, childData, config);
    return response.data;
  },

  // Delete a child profile (soft delete)
  delete: async (childId) => {
    const response = await api.delete(`/subprofiles/${childId}`);
    return response.data;
  },

  // Request a video for a child
  requestVideo: async (childId, videoId) => {
    const response = await api.post(`/subprofiles/${childId}/request-video`, { videoId });
    return response.data;
  },

  // Approve or reject a video request
  approveVideo: async (childId, videoId, action) => {
    const response = await api.put(`/subprofiles/${childId}/approve-video/${videoId}`, { action });
    return response.data;
  },

  // Remove a video from approved list
  removeApprovedVideo: async (childId, videoId) => {
    const response = await api.delete(`/subprofiles/${childId}/approved-video/${videoId}`);
    return response.data;
  },

  // Child requests a video (for child users)
  requestVideoAsChild: async (videoId) => {
    const response = await api.post('/subprofiles/request-video', { videoId });
    return response.data;
  },

  // Track search history (for child users)
  trackSearchHistory: async (query, resultsCount) => {
    const response = await api.post('/subprofiles/search-history', { query, resultsCount });
    return response.data;
  },

  // Track watch history (for child users)
  trackWatchHistory: async (videoId, watchDuration, completed) => {
    const response = await api.post('/subprofiles/watch-history', { videoId, watchDuration, completed });
    return response.data;
  },

  // Get search and watch history (for parents)
  getHistory: async (childId) => {
    const response = await api.get(`/subprofiles/${childId}/history`);
    return response.data;
  },

  // Clear search history (for parents)
  clearSearchHistory: async (childId) => {
    const response = await api.delete(`/subprofiles/${childId}/search-history`);
    return response.data;
  },

  // Clear watch history (for parents)
  clearWatchHistory: async (childId) => {
    const response = await api.delete(`/subprofiles/${childId}/watch-history`);
    return response.data;
  },

  // Get approved videos (for child users)
  getApprovedVideos: async () => {
    console.log('Calling getApprovedVideos API...');
    const response = await api.get('/subprofiles/approved-videos');
    console.log('getApprovedVideos API response:', response);
    return response.data;
  }
}; 