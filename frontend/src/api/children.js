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
  }
}; 