import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  IconButton
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  VideoLibrary,
  CheckCircle,
  Pending,
  Cancel,
  PhotoCamera
} from '@mui/icons-material';
import { childrenAPI } from '../api/children';

const Children = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: ''
  });
  const [idImage, setIdImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await childrenAPI.getAll();
      setChildren(response);
    } catch (error) {
      setError('Failed to fetch children profiles');
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (child = null) => {
    if (child) {
      setEditingChild(child);
      setFormData({
        name: child.name,
        dateOfBirth: child.dateOfBirth.split('T')[0],
        gender: child.gender
      });
      // Set image preview if child has an ID image
      if (child.idImage) {
        setImagePreview(`http://localhost:5000/uploads/images/${child.idImage}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setEditingChild(null);
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: ''
      });
      setImagePreview(null);
    }
    setIdImage(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingChild(null);
    setFormData({
      name: '',
      dateOfBirth: '',
      gender: ''
    });
    setIdImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setIdImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setIdImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (idImage) {
        formDataToSend.append('idImage', idImage);
      }

      if (editingChild) {
        await childrenAPI.update(editingChild._id, formDataToSend);
      } else {
        await childrenAPI.create(formDataToSend);
      }
      
      await fetchChildren();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save child profile');
      console.error('Error saving child profile:', error);
    }
  };

  const handleDelete = async (childId) => {
    if (window.confirm('Are you sure you want to delete this child profile?')) {
      try {
        await childrenAPI.delete(childId);
        fetchChildren();
      } catch (error) {
        setError('Failed to delete child profile');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'rejected':
        return <Cancel />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Child Profiles
        </Typography>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
        >
          <Add />
        </Fab>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {children.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Child Profiles Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your first child profile to start managing their video content.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Child Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {children.map((child) => (
            <Grid item xs={12} sm={6} md={4} key={child._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {child.idImage ? (
                      <Avatar 
                        src={`http://localhost:5000/uploads/images/${child.idImage}`}
                        sx={{ mr: 2, width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                        {child.name.charAt(0)}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="h6" component="h2">
                        {child.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Age: {child.age} • {child.gender}
                      </Typography>
                      {child.idImage && (
                        <Typography variant="caption" color="success.main">
                          📷 ID Image uploaded
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requested Videos: {child.requestedVideos.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved Videos: {child.approvedVideos.length}
                    </Typography>
                  </Box>

                  {child.requestedVideos.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Recent Requests:
                      </Typography>
                      {child.requestedVideos.slice(0, 3).map((request, index) => (
                        <Chip
                          key={index}
                          size="small"
                          icon={getStatusIcon(request.status)}
                          label={request.video?.title || 'Video'}
                          color={getStatusColor(request.status)}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleOpenDialog(child)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<VideoLibrary />}
                    onClick={() => {/* Navigate to child's video management */}}
                  >
                    Manage Videos
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(child._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingChild ? 'Edit Child Profile' : 'Add Child Profile'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Date of Birth"
              type="date"
              fullWidth
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                📷 Upload ID Image
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Avatar
                    src={imagePreview}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '3px solid #1976d2',
                      backgroundColor: imagePreview ? 'transparent' : '#e3f2fd'
                    }}
                  >
                    {!imagePreview && '👤'}
                  </Avatar>
                  
                  {imagePreview && (
                    <IconButton
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: '#f44336',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#d32f2f',
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="id-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="id-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCamera />}
                    sx={{ mb: 1 }}
                  >
                    Choose ID Photo
                  </Button>
                </label>
                
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Upload a clear photo of the child's ID (JPEG, PNG, GIF, WebP up to 5MB)
                </Typography>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingChild ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Children; 