import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  VideoLibrary,
  FamilyRestroom,
  Home,
  Upload,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/landing');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const isActive = (path) => location.pathname === path;
  const isParent = user && user.userType === 'parent';
  const menuItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Videos', path: '/videos', icon: <VideoLibrary /> },
    ...(isParent ? [
      { text: 'Children', path: '/children', icon: <FamilyRestroom /> }
     ,
    ] : []),
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
          onClick={handleMobileMenuOpen}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          KidsTube
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {/* User Profile Menu */}
        {user && (
          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        )}

        {/* Desktop Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                navigate(item.path);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              {item.icon}
              <Typography sx={{ ml: 1 }}>{item.text}</Typography>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={handleProfile}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 