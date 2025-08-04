import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FamilyRestroomRounded, 
  ChildCareRounded,
  LockRounded,
  SecurityRounded
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();
  const { loginChild, loginParent } = useAuth();
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    sixDigitCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [tempCredentials, setTempCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (userType === 'child') {
      const { sixDigitCode, ...childCredentials } = formData;
      result = await loginChild(childCredentials);
    } else {
      // For parent, first validate email and password
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }
      
      // Store credentials and show code dialog
      setTempCredentials({ email: formData.email, password: formData.password });
      setShowCodeDialog(true);
      setLoading(false);
      return;
    }
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleCodeSubmit = async () => {
    if (!formData.sixDigitCode || !/^\d{6}$/.test(formData.sixDigitCode)) {
      setError('Six digit code must be exactly 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    const result = await loginParent({
      email: tempCredentials.email,
      password: tempCredentials.password,
      sixDigitCode: formData.sixDigitCode
    });
    
    if (result.success) {
      setShowCodeDialog(false);
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e);
    }
  };

  const resetForm = () => {
    setUserType(null);
    setFormData({
      email: '',
      password: '',
      sixDigitCode: ''
    });
    setError('');
    setShowCodeDialog(false);
    setTempCredentials({ email: '', password: '' });
  };

  if (!userType) {
    return (
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h3" sx={{ mb: 4, color: '#1976d2', textAlign: 'center' }}>
            Welcome to KidsTube
          </Typography>
          
          <Typography component="h2" variant="h5" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
            Choose how you'd like to access your account
          </Typography>

          <Grid container spacing={4}  justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => setUserType('child')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <ChildCareRounded sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                    I'm a Child
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access your profile using your parent's email and password
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    variant="contained" 
                    color="success"
                    size="large"
                    startIcon={<ChildCareRounded />}
                  >
                    Continue as Child
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => setUserType('parent')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <FamilyRestroomRounded sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                    I'm a Parent
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Access your account with email, password, and security code
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    startIcon={<SecurityRounded />}
                  >
                    Continue as Parent
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Don't have an account yet?
            </Typography>
            <Link component={RouterLink} to="/register" variant="body1" sx={{ fontWeight: 'bold' }}>
              Create a new account
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {userType === 'child' ? (
              <ChildCareRounded sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
            ) : (
              <FamilyRestroomRounded sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
            )}
            <Typography component="h1" variant="h4" sx={{ color: userType === 'child' ? '#4caf50' : '#1976d2' }}>
              KidsTube
            </Typography>
          </Box>
          
          <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
            Sign In as {userType === 'child' ? 'Child' : 'Parent'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              type="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                backgroundColor: userType === 'child' ? '#4caf50' : '#1976d2',
                '&:hover': {
                  backgroundColor: userType === 'child' ? '#388e3c' : '#1565c0'
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : `Sign In as ${userType === 'child' ? 'Child' : 'Parent'}`}
            </Button>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={resetForm}
                sx={{ mb: 1 }}
              >
                Choose Different User Type
              </Button>
              <Box>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Six Digit Code Dialog for Parents */}
      <Dialog 
        open={showCodeDialog} 
        onClose={() => setShowCodeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <SecurityRounded sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
            <Typography variant="h5">Security Verification</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Please enter your 6-digit security code to complete the login process.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            required
            fullWidth
            name="sixDigitCode"
            label="Six Digit Security Code"
            type="text"
            id="sixDigitCode"
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*'
            }}
            helperText="Enter the 6-digit code you created during registration"
            value={formData.sixDigitCode}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowCodeDialog(false)}
            variant="outlined"
            fullWidth
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCodeSubmit}
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Verify & Sign In'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Landing;
