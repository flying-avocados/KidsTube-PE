import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useSubProfile } from '../contexts/SubProfileContext';

const Profile = () => {
  const { subProfiles, addSubProfile, updateSubProfile, deleteSubProfile } = useSubProfile();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');

  const handleOpenDialog = (profile = null) => {
    if (profile) {
      setEditingProfile(profile);
      setName(profile.name);
      setAvatar(profile.avatar || '');
    } else {
      setEditingProfile(null);
      setName('');
      setAvatar('');
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProfile(null);
    setName('');
    setAvatar('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      if (editingProfile) {
        await updateSubProfile(editingProfile._id, name, avatar);
      } else {
        await addSubProfile(name, avatar);
      }
      handleCloseDialog();
    } catch (error) {
      setError('Failed to save sub-profile');
    }
  };

  const handleDelete = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this sub-profile?')) {
      try {
        await deleteSubProfile(profileId);
      } catch (error) {
        setError('Failed to delete sub-profile');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Manage Sub-Profiles
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Sub-Profile
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {subProfiles.length === 0 ? (
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No sub-profiles created yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Create your first sub-profile to start uploading videos
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {subProfiles.map((profile) => (
                <Grid item xs={12} sm={6} md={4} key={profile._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            profile.name.charAt(0)
                          )}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2">
                            {profile.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Created {new Date(profile.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(profile)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(profile._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProfile ? 'Edit Sub-Profile' : 'Add New Sub-Profile'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Avatar URL (optional)"
            fullWidth
            variant="outlined"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProfile ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 