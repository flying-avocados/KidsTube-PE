import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { childrenAPI } from '../api/children';

const PrivacyPolicy = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await childrenAPI.getAll();
        setChildren(data);
      } catch (error) {
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          KidsTube values your privacy. We collect the information necessary to provide a safe and enjoyable experience for children and parents. Your data may be shared with third parties. You can view all information associated with your account below.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your Information
        </Typography>
        {user ? (
          <Box sx={{ mb: 2 }}>
            <Typography><b>Username:</b> {user.username}</Typography>
            <Typography><b>Email:</b> {user.email}</Typography>
            <Typography><b>Name:</b> {user.firstName} {user.lastName}</Typography>
            <Typography><b>User Type:</b> {user.userType || 'parent'}</Typography>
            <Typography><b>Account Active:</b> {user.isActive ? 'Yes' : 'No'}</Typography>
          </Box>
        ) : (
          <Typography>No user information found.</Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Subprofiles
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : children.length === 0 ? (
          <Typography>No subprofiles found.</Typography>
        ) : (
          <List>
            {children.map(child => (
              <ListItem key={child._id} alignItems="flex-start">
                <ListItemText
                  primary={child.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">Gender: {child.gender}</Typography><br />
                      <Typography component="span" variant="body2">Date of Birth: {new Date(child.dateOfBirth).toLocaleDateString()}</Typography><br />
                      <Typography component="span" variant="body2">Active: {child.isActive ? 'Yes' : 'No'}</Typography><br />
                      <Typography component="span" variant="body2">Approved Videos: {child.approvedVideos?.length || 0}</Typography><br />
                      <Typography component="span" variant="body2">Requested Videos: {child.requestedVideos?.length || 0}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Watch History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Watch history feature coming soon. 
        </Typography>
      </Paper>
    </Box>
  );
};

export default PrivacyPolicy; 