import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Close, Cookie } from '@mui/icons-material';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const hasSeenBanner = localStorage.getItem('cookieBannerDismissed');
    if (!hasSeenBanner) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieBannerDismissed', 'true');
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('cookieBannerDismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <Snackbar
      open={showBanner}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbar-root': {
          bottom: 20,
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 2,
          maxWidth: 600,
          width: '100%',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
          border: '2px solid #2196f3',
          borderRadius: 3,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Cookie sx={{ fontSize: 32, color: '#ff9800', mt: 0.5 }} />
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: '#1976d2',
              mb: 1,
              fontFamily: 'inherit'
            }}>
              🍪 Cookie Notice
            </Typography>
            
            <Typography variant="body2" sx={{ 
              color: '#333',
              mb: 2,
              lineHeight: 1.6,
              fontFamily: 'inherit'
            }}>
              We use cookies to make KidsTube work better for you! By continuing to use KidsTube, 
              you agree to our use of cookies. 🧸✨
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleAccept}
                sx={{
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                  }
                }}
              >
                Accept Cookies 🎉
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={handleDismiss}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  }
                }}
              >
                Maybe Later
              </Button>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleDismiss}
            sx={{
              color: '#666',
              '&:hover': {
                color: '#333',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Paper>
    </Snackbar>
  );
};

export default CookieBanner; 