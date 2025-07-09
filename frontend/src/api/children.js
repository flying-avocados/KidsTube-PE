import api from './config';

export const childrenAPI = {
  // Get all child profiles for the parent
  getAll: async () => {
    const response = await api.get('/children');
    return response.data;
  },

  // Create a new child profile
  create: async (childData) => {
    const response = await api.post('/children', childData);
    return response.data;
  },

  // Get a specific child profile
  getById: async (childId) => {
    const response = await api.get(`/children/${childId}`);
    return response.data;
  },

  // Update a child profile
  update: async (childId, childData) => {
    const response = await api.put(`/children/${childId}`, childData);
    return response.data;
  },

  // Delete a child profile (soft delete)
  delete: async (childId) => {
    const response = await api.delete(`/children/${childId}`);
    return response.data;
  },

  // Request a video for a child
  requestVideo: async (childId, videoId) => {
    const response = await api.post(`/children/${childId}/request-video`, { videoId });
    return response.data;
  },

  // Approve or reject a video request
  approveVideo: async (childId, videoId, action) => {
    const response = await api.put(`/children/${childId}/approve-video/${videoId}`, { action });
    return response.data;
  },

  // Remove a video from approved list
  removeApprovedVideo: async (childId, videoId) => {
    const response = await api.delete(`/children/${childId}/approved-video/${videoId}`);
    return response.data;
  }
}; 