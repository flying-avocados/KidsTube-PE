import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  ArrowBack,
  AccessTime
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { videosAPI } from '../api/videos';
import { childrenAPI } from '../api/children';
import { useAuth } from '../contexts/AuthContext';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchStartTime, setWatchStartTime] = useState(null);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    fetchVideo();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (video && user && user.userType === 'child') {
      setWatchStartTime(Date.now());
      startTrackingWatchTime();
    }
  }, [video, user]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getById(videoId);
      setVideo(response);
    } catch (error) {
      setError('Failed to fetch video');
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrackingWatchTime = () => {
    progressInterval.current = setInterval(() => {
      if (isPlaying) {
        setTotalWatchTime(prev => prev + 1);
      }
    }, 1000);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = async () => {
    // Track completed watch history for child users
    if (user && user.userType === 'child') {
      try {
        await childrenAPI.trackWatchHistory(videoId, totalWatchTime, true);
      } catch (error) {
        console.error('Error tracking watch history:', error);
      }
    }
  };

  const handleSeek = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    // Track partial watch history before leaving
    if (user && user.userType === 'child' && totalWatchTime > 0) {
      childrenAPI.trackWatchHistory(videoId, totalWatchTime, false)
        .catch(error => console.error('Error tracking watch history:', error));
    }
    navigate('/videos');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !video) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Video not found'}
        </Alert>
        <Button onClick={() => navigate('/videos')} startIcon={<ArrowBack />}>
          Back to Videos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          onClick={handleBack} 
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Videos
        </Button>
        
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          {video.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={video.category} color="primary" />
          {video.ageRange && (
            <Chip label={`Ages ${video.ageRange.min}-${video.ageRange.max}`} color="secondary" />
          )}
          <Chip label={formatTime(video.duration)} icon={<AccessTime />} />
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <video
            ref={videoRef}
            src={`http://localhost:5000/api/videos/stream/${video.filename}`}
            style={{ width: '100%', height: 'auto', maxHeight: '70vh' }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleTimeUpdate}
            muted={isMuted}
          />
          
          {/* Video Controls Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {/* Progress Bar */}
            <Box
              sx={{
                width: '100%',
                height: 4,
                bgcolor: 'rgba(255,255,255,0.3)',
                borderRadius: 2,
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={handleSeek}
            >
              <Box
                sx={{
                  width: `${(currentTime / duration) * 100}%`,
                  height: '100%',
                  bgcolor: '#1976d2',
                  borderRadius: 2,
                  transition: 'width 0.1s'
                }}
              />
            </Box>
            
            {/* Control Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              
              <IconButton onClick={() => setIsMuted(!isMuted)} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              
              <Typography variant="body2" sx={{ color: 'white', ml: 'auto' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
              
              <IconButton sx={{ color: 'white' }}>
                <Fullscreen />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {video.description || 'No description available.'}
          </Typography>
          
          {video.tags && video.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {video.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VideoPlayer; 