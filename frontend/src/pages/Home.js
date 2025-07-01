import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/videos');
      setVideos(response.data);
    } catch (error) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', error);
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

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to KidsTube-PE
      </Typography>
      
      {videos.length === 0 ? (
        <Box textAlign="center" sx={{ mt: 8 }}>
          <Typography variant="h6" color="textSecondary">
            No videos uploaded yet. Be the first to share!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 3,
                  },
                }}
                onClick={() => navigate(`/video/${video._id}`)}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    backgroundColor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    🎥 Video
                  </Typography>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" noWrap>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {video.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      U
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      Uploaded by User
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(video.uploadDate)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home; 