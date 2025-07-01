import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubProfile } from '../contexts/SubProfileContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { subProfiles, currentSubProfile, setCurrentSubProfile } = useSubProfile();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSubProfileChange = (event) => {
    const selectedProfile = subProfiles.find(sp => sp._id === event.target.value);
    setCurrentSubProfile(selectedProfile);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          KidsTube-PE
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {subProfiles.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'white' }}>Profile</InputLabel>
                <Select
                  value={currentSubProfile?._id || ''}
                  onChange={handleSubProfileChange}
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {subProfiles.map((profile) => (
                    <MenuItem key={profile._id} value={profile._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {profile.name.charAt(0)}
                        </Avatar>
                        {profile.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button 
              color="inherit" 
              onClick={() => navigate('/upload')}
            >
              Upload
            </Button>

            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
            >
              Profile
            </Button>

            <Avatar 
              onClick={handleMenu}
              sx={{ cursor: 'pointer' }}
            >
              U
            </Avatar>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 