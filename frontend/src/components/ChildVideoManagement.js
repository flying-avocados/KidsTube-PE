import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Cancel,
  Pending,
  VideoLibrary,
  Visibility,
  ThumbUp,
  Comment,
  AccessTime,
  Person
} from '@mui/icons-material';
import { childrenAPI } from '../api/children';
import { videosAPI } from '../api/videos';

const ChildVideoManagement = ({ childId, childName, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const response = await childrenAPI.getById(childId);
      setChildData(response);
    } catch (error) {
      setError('Failed to fetch child data');
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVideo = async (requestId, videoId) => {
    try {
      setProcessingRequest(requestId);
      console.log('Attempting to approve video:', { childId, videoId, action: 'approve' });
      
      const response = await childrenAPI.approveVideo(childId, videoId, 'approve');
      console.log('Approve video response:', response);
      
      await fetchChildData(); // Refresh data
    } catch (error) {
      console.error('Error approving video:', error);
      console.error('Error response:', error.response?.data);
      setError(`Failed to approve video: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectVideo = async (requestId, videoId) => {
    try {
      setProcessingRequest(requestId);
      console.log('Attempting to reject video:', { childId, videoId, action: 'reject' });
      
      const response = await childrenAPI.approveVideo(childId, videoId, 'reject');
      console.log('Reject video response:', response);
      
      await fetchChildData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting video:', error);
      console.error('Error response:', error.response?.data);
      setError(`Failed to reject video: ${error.response?.data?.message || error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRemoveApprovedVideo = async (videoId) => {
    try {
      setProcessingRequest(videoId);
      await childrenAPI.removeApprovedVideo(childId, videoId);
      await fetchChildData(); // Refresh data
    } catch (error) {
      setError('Failed to remove video');
      console.error('Error removing video:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleViewVideo = (video) => {
    setSelectedVideo(video);
    setVideoDialogOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return <Pending />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!childData) {
    return (
      <Alert severity="error">
        Child data not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          📺 Manage Videos for {childName}
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<Pending />} 
            label={`Pending Requests (${childData.requestedVideos.filter(r => r.status === 'pending').length})`}
            iconPosition="start"
          />
          <Tab 
            icon={<CheckCircle />} 
            label={`Approved Videos (${childData.approvedVideos.length})`}
            iconPosition="start"
          />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {/* Pending Requests Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  ⏳ Pending Video Requests
                </Typography>
              </Box>
              
              {childData.requestedVideos.filter(r => r.status === 'pending').length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Pending sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No pending requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {childName} hasn't requested any videos yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {childData.requestedVideos
                    .filter(r => r.status === 'pending')
                    .map((request, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                            <VideoLibrary />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {request.video?.title || 'Unknown Video'}
                              </Typography>
                              <Chip 
                                size="small" 
                                label="Pending"
                                color="warning"
                                icon={<Pending />}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {request.video?.description || 'No description available'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Chip label={request.video?.category} size="small" color="primary" />
                                <Chip label={formatDuration(request.video?.duration || 0)} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  Requested: {formatDate(request.requestedAt)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewVideo(request.video)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            disabled={processingRequest === request._id}
                            onClick={() => handleApproveVideo(request._id, request.video._id)}
                          >
                            {processingRequest === request._id ? <CircularProgress size={16} /> : 'Approve'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            disabled={processingRequest === request._id}
                            onClick={() => handleRejectVideo(request._id, request.video._id)}
                          >
                            {processingRequest === request._id ? <CircularProgress size={16} /> : 'Reject'}
                          </Button>
                        </Box>
                      </ListItem>
                      {index < childData.requestedVideos.filter(r => r.status === 'pending').length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Approved Videos Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  ✅ Approved Videos
                </Typography>
              </Box>
              
              {childData.approvedVideos.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No approved videos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved videos will appear here
                  </Typography>
                </Box>
              ) : (
                <List>
                  {childData.approvedVideos.map((approved, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                            <VideoLibrary />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {approved.video?.title || 'Unknown Video'}
                              </Typography>
                              <Chip 
                                size="small" 
                                label="Approved"
                                color="success"
                                icon={<CheckCircle />}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {approved.video?.description || 'No description available'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Chip label={approved.video?.category} size="small" color="primary" />
                                <Chip label={formatDuration(approved.video?.duration || 0)} size="small" />
                                <Typography variant="caption" color="text.secondary">
                                  Approved: {formatDate(approved.approvedAt)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewVideo(approved.video)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            disabled={processingRequest === approved.video._id}
                            onClick={() => handleRemoveApprovedVideo(approved.video._id)}
                          >
                            {processingRequest === approved.video._id ? <CircularProgress size={16} /> : 'Remove'}
                          </Button>
                        </Box>
                      </ListItem>
                      {index < childData.approvedVideos.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Video Preview Dialog */}
      <Dialog open={videoDialogOpen} onClose={() => setVideoDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedVideo?.title}
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedVideo.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedVideo.description || 'No description available'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={selectedVideo.category} color="primary" />
                  <Chip label={formatDuration(selectedVideo.duration || 0)} />
                  {selectedVideo.ageRange && (
                    <Chip label={`Ages ${selectedVideo.ageRange.min}-${selectedVideo.ageRange.max}`} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedVideo.views || 0} views
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ThumbUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedVideo.likeCount || 0} likes
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedVideo.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChildVideoManagement; 