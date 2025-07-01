import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
      setVideo(response.data);
    } catch (error) {
      setError('Video not found');
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Video not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {video.title}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative', width: '100%', backgroundColor: 'black' }}>
          <video
            controls
            style={{ width: '100%', maxHeight: '70vh' }}
            src={`http://localhost:5000/api/videos/stream/${video.filename}`}
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNCAxMkw0MCAyNEwyNCAzNlYxMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>
            U
          </Avatar>
          <Box>
            <Typography variant="h6">
              Uploaded by User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(video.uploadDate)}
            </Typography>
          </Box>
        </Box>

        {video.description && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {video.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Video" color="primary" />
          <Chip label="KidsTube-PE" variant="outlined" />
        </Box>
      </Paper>
    </Container>
  );
};

export default VideoPlayer; 