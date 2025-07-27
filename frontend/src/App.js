import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Upload from './pages/Upload';
import Children from './pages/Children';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f3e8ff', // light purple
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: '"Comic Sans MS", "Comic Neue", "Baloo", "Arial Rounded MT Bold", "Arial", sans-serif',
  },
});

// Add a ParentRoute wrapper
const ParentRoute = ({ children }) => {
  const { user, loading } = require('./contexts/AuthContext').useAuth();
  if (loading) return null;
  if (!user || user.userType !== 'parent') {
    return <Navigate to="/landing" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navigation />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/videos" element={
                  <ProtectedRoute>
                    <Videos />
                  </ProtectedRoute>
                } />
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <ParentRoute>
                      <Upload />
                    </ParentRoute>
                  </ProtectedRoute>
                } />
                <Route path="/children" element={
                  <ProtectedRoute>
                    <ParentRoute>
                      <Children />
                    </ParentRoute>
                  </ProtectedRoute>
                } />
                <Route path="/my-videos" element={
                  <ProtectedRoute>
                    <ParentRoute>
                      <Videos myVideos />
                    </ParentRoute>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/privacy" element={
                  <ProtectedRoute>
                    <PrivacyPolicy />
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/landing" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
