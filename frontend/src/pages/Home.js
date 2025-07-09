import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import {
  VideoLibrary,
  FamilyRestroom,
  Upload,
  TrendingUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, stats, fetchStats } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  const features = [
    {
      title: 'Browse Videos',
      description: 'Discover age-appropriate educational content for your children',
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      path: '/videos',
      color: '#1976d2'
    },
    {
      title: 'Manage Children',
      description: 'Create and manage child profiles with personalized content',
      icon: <FamilyRestroom sx={{ fontSize: 40 }} />,
      path: '/children',
      color: '#388e3c'
    },
    {
      title: 'Upload Content',
      description: 'Share educational videos with the KidsTube community',
      icon: <Upload sx={{ fontSize: 40 }} />,
      path: '/upload',
      color: '#f57c00'
    },
    {
      title: 'My Videos',
      description: 'View and manage your uploaded content',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      path: '/my-videos',
      color: '#7b1fa2'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?children+education)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
              }}
            >
              <Typography variant="h3" color="inherit" gutterBottom>
                Welcome to KidsTube
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                A safe, educational video platform designed for parents to curate
                age-appropriate content for their children.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/videos')}
                sx={{ mt: 2 }}
              >
                Start Exploring
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* User Stats Section */}
      {user && stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Your Videos
                </Typography>
                <Typography variant="h4">
                  {stats.videoCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Child Profiles
                </Typography>
                <Typography variant="h4">
                  {stats.childCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Views
                </Typography>
                <Typography variant="h4">
                  {stats.totalViews.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Features Section */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        What You Can Do
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: feature.color,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography gutterBottom variant="h6" component="h2">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(feature.path)}
                  sx={{ width: '100%' }}
                >
                  Get Started
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* About Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          About KidsTube
        </Typography>
        <Typography variant="body1" paragraph>
          KidsTube is a family-friendly video platform that puts parents in control of their children's viewing experience. 
          Our platform allows parents to create individual profiles for each child, request videos for approval, 
          and ensure that all content is age-appropriate and educational.
        </Typography>
        <Typography variant="body1" paragraph>
          Whether you're looking for educational content, creative activities, or wholesome entertainment, 
          KidsTube provides a safe environment where parents can curate the perfect viewing experience for their children.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 