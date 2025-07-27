import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  PlayArrow,
  ThumbUp,
  ThumbUpOutlined,
  Comment,
  Visibility,
  Search,
  FilterList,
  CheckCircle,
  VideoLibrary
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { videosAPI } from '../api/videos';
import { childrenAPI } from '../api/children';
import { useAuth } from '../contexts/AuthContext';

const Videos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [approvedVideos, setApprovedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [requestingVideo, setRequestingVideo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    ageMin: '',
    ageMax: ''
  });

  const categories = [
    'educational',
    'entertainment',
    'music',
    'story',
    'art',
    'science',
    'other'
  ];

  useEffect(() => {
    fetchVideos();
    if (user && user.userType === 'child') {
      fetchApprovedVideos();
    }
  }, [page, filters]);

  // Refresh approved videos every 30 seconds for child users
  useEffect(() => {
    if (user && user.userType === 'child') {
      // Initial fetch
      fetchApprovedVideos();
      
      const interval = setInterval(() => {
        fetchApprovedVideos();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await videosAPI.getAll(params);
      setVideos(response.videos);
      setTotalPages(response.totalPages);
    } catch (error) {
      setError('Failed to fetch videos');
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedVideos = async () => {
    try {
      console.log('Fetching approved videos...');
      const response = await childrenAPI.getApprovedVideos();
      console.log('Approved videos response:', response);
      
      const newApprovedVideos = response.approvedVideos || [];
      console.log('New approved videos:', newApprovedVideos);
      
      // Check if there are new approved videos
      if (newApprovedVideos.length > approvedVideos.length) {
        const newVideos = newApprovedVideos.filter(newVideo => 
          !approvedVideos.some(oldVideo => oldVideo.video._id === newVideo.video._id)
        );
        
        if (newVideos.length > 0) {
          setSuccessMessage(`🎉 ${newVideos.length} new video${newVideos.length > 1 ? 's' : ''} approved!`);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      }
      
      setApprovedVideos(newApprovedVideos);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching approved videos:', error);
      console.error('Error response:', error.response?.data);
      
      // Only show error if it's not a 404 (no child profiles)
      if (error.response?.status !== 404) {
        setError(`Failed to fetch approved videos: ${error.response?.data?.message || error.message}`);
      } else {
        // 404 means no child profiles found, which is normal for new users
        setApprovedVideos([]);
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
    
    // Track search history for child users
    if (field === 'search' && value && user && user.userType === 'child') {
      trackSearchHistory(value);
    }
  };

  const trackSearchHistory = async (query) => {
    try {
      const resultsCount = videos.length; // Approximate results count
      await childrenAPI.trackSearchHistory(query, resultsCount);
    } catch (error) {
      console.error('Error tracking search history:', error);
    }
  };

  const handleVideoPlay = async (videoId) => {
    // Track watch history for child users
    if (user && user.userType === 'child') {
      try {
        await childrenAPI.trackWatchHistory(videoId, 0, false);
      } catch (error) {
        console.error('Error tracking watch history:', error);
      }
    }
    
    // Navigate to video player
    navigate(`/video/${videoId}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRequestVideo = async (videoId) => {
    try {
      setRequestingVideo(videoId);
      await childrenAPI.requestVideoAsChild(videoId);
      setError('');
      setSuccessMessage('Video requested successfully! Your parent will review it.');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to request video');
    } finally {
      setRequestingVideo(null);
    }
  };

  const getThumbnailUrl = (video) => {
    if (video.thumbnail) {
      return video.thumbnail;
    }
    // Return a placeholder image based on category
    return `https://source.unsplash.com/300x200/?${video.category || 'education'}`;
  };

  if (loading && videos.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {user && user.userType === 'child' ? 'My Videos' : 'Browse Videos'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Tabs for child users */}
      {user && user.userType === 'child' && (
        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              icon={<VideoLibrary />} 
              label={`Browse Videos (${videos.length})`}
              iconPosition="start"
            />
            <Tab 
              icon={<CheckCircle />} 
              label={`My Approved Videos (${approvedVideos.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>
      )}

      {/* Browse Videos Tab */}
      {(user?.userType === 'parent' || (user?.userType === 'child' && activeTab === 0)) && (
        <>
          {/* Filters */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterList sx={{ mr: 1 }} />
              <Typography variant="h6">Filters</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search videos"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Min Age"
                  type="number"
                  value={filters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  inputProps={{ min: 0, max: 18 }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Max Age"
                  type="number"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  inputProps={{ min: 0, max: 18 }}
                />
              </Grid>
            </Grid>
          </Card>

          {/* Videos Grid */}
          {loading && videos.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {videos.map((video) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={getThumbnailUrl(video)}
                        alt={video.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatDuration(video.duration || 0)}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom noWrap>
                          {video.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {video.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            by {video.uploader?.firstName} {video.uploader?.lastName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            label={video.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={`${video.ageRange?.min}-${video.ageRange?.max} years`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {video.views}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ThumbUpOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {video.likeCount || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Comment sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {video.commentCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        {user && user.userType === 'parent' && (
                          <>
                            <Button
                              size="small"
                              startIcon={<PlayArrow />}
                              onClick={() => handleVideoPlay(video._id)}
                            >
                              Watch
                            </Button>
                            <Button
                              size="small"
                              onClick={() => navigate(`/video/${video._id}`)}
                            >
                              Details
                            </Button>
                          </>
                        )}
                        {user && user.userType === 'child' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            disabled={requestingVideo === video._id}
                            onClick={() => handleRequestVideo(video._id)}
                          >
                            {requestingVideo === video._id ? 'Requesting...' : 'Request Video'}
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Approved Videos Tab for Child Users */}
      {user && user.userType === 'child' && activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#1976d2' }}>
              ✅ My Approved Videos
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={fetchApprovedVideos}
                size="small"
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  console.log('Current user:', user);
                  console.log('Current approved videos:', approvedVideos);
                  setSuccessMessage('Check console for debug info');
                  setTimeout(() => setSuccessMessage(''), 3000);
                }}
                size="small"
              >
                Debug
              </Button>
            </Box>
          </Box>
          
          {approvedVideos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No approved videos yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Request videos from the Browse tab and wait for parent approval
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {approvedVideos.map((approved) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={approved.video._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={getThumbnailUrl(approved.video)}
                      alt={approved.video.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatDuration(approved.video.duration || 0)}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {approved.video.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {approved.video.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={approved.video.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${approved.video.ageRange?.min}-${approved.video.ageRange?.max} years`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Approved: {new Date(approved.approvedAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => handleVideoPlay(approved.video._id)}
                        fullWidth
                      >
                        Watch Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Videos; 