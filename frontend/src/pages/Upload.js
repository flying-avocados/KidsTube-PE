import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSubProfile } from '../contexts/SubProfileContext';
import axios from 'axios';

const Upload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSubProfile, setSelectedSubProfile] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { subProfiles } = useSubProfile();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid video file');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !selectedFile || !selectedSubProfile) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subProfileId', selectedSubProfile);
    formData.append('video', selectedFile);

    try {
      await axios.post('http://localhost:5000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Video uploaded successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Upload Video
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Video Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description (optional)"
              name="description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="sub-profile-label">Select Sub-Profile</InputLabel>
              <Select
                labelId="sub-profile-label"
                id="sub-profile"
                value={selectedSubProfile}
                label="Select Sub-Profile"
                onChange={(e) => setSelectedSubProfile(e.target.value)}
              >
                {subProfiles.map((profile) => (
                  <MenuItem key={profile._id} value={profile._id}>
                    {profile.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="video-file"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="video-file">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Choose Video File'}
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Box>

            {uploading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  Uploading video...
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={uploading || !selectedFile || !title || !selectedSubProfile}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Upload; 