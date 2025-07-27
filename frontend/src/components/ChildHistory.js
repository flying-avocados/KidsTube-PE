import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import {
  Search,
  PlayArrow,
  History,
  Delete,
  Clear,
  AccessTime,
  VideoLibrary,
  TrendingUp
} from '@mui/icons-material';
import { childrenAPI } from '../api/children';

const ChildHistory = ({ childId, childName }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState({ searchHistory: [], watchHistory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearType, setClearType] = useState('');

  useEffect(() => {
    if (childId) {
      fetchHistory();
    }
  }, [childId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await childrenAPI.getHistory(childId);
      setHistory(response);
    } catch (error) {
      setError('Failed to fetch history');
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      if (clearType === 'search') {
        await childrenAPI.clearSearchHistory(childId);
        setHistory(prev => ({ ...prev, searchHistory: [] }));
      } else if (clearType === 'watch') {
        await childrenAPI.clearWatchHistory(childId);
        setHistory(prev => ({ ...prev, watchHistory: [] }));
      }
      setClearDialogOpen(false);
    } catch (error) {
      setError('Failed to clear history');
      console.error('Error clearing history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSearchIcon = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('cartoon') || lowerQuery.includes('animation')) return '🎬';
    if (lowerQuery.includes('education') || lowerQuery.includes('learn')) return '📚';
    if (lowerQuery.includes('music') || lowerQuery.includes('song')) return '🎵';
    if (lowerQuery.includes('game') || lowerQuery.includes('play')) return '🎮';
    return '🔍';
  };

  const getVideoIcon = (category) => {
    switch (category) {
      case 'education': return '📚';
      case 'entertainment': return '🎬';
      case 'music': return '🎵';
      case 'gaming': return '🎮';
      default: return '📺';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          📊 {childName}'s History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={() => {
            setClearType('all');
            setClearDialogOpen(true);
          }}
          color="error"
        >
          Clear All History
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<Search />} 
            label={`Search History (${history.searchHistory.length})`}
            iconPosition="start"
          />
          <Tab 
            icon={<PlayArrow />} 
            label={`Watch History (${history.watchHistory.length})`}
            iconPosition="start"
          />
        </Tabs>

        <CardContent sx={{ p: 0 }}>
          {/* Search History Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  🔍 Recent Searches
                </Typography>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => {
                    setClearType('search');
                    setClearDialogOpen(true);
                  }}
                  color="error"
                >
                  Clear Search History
                </Button>
              </Box>
              
              {history.searchHistory.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No search history yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Search history will appear here when {childName} searches for videos
                  </Typography>
                </Box>
              ) : (
                <List>
                  {history.searchHistory.map((search, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                            {getSearchIcon(search.query)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                "{search.query}"
                              </Typography>
                              <Chip 
                                size="small" 
                                label={`${search.resultsCount} results`}
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <AccessTime sx={{ fontSize: 16 }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(search.searchedAt)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < history.searchHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Watch History Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ color: '#1976d2' }}>
                  📺 Watched Videos
                </Typography>
                <Button
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => {
                    setClearType('watch');
                    setClearDialogOpen(true);
                  }}
                  color="error"
                >
                  Clear Watch History
                </Button>
              </Box>
              
              {history.watchHistory.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <PlayArrow sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No watch history yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Watch history will appear here when {childName} watches videos
                  </Typography>
                </Box>
              ) : (
                <List>
                  {history.watchHistory.map((watch, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                            {getVideoIcon(watch.video?.category)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {watch.video?.title || 'Unknown Video'}
                              </Typography>
                              {watch.completed && (
                                <Chip 
                                  size="small" 
                                  label="Completed"
                                  color="success"
                                  icon={<PlayArrow />}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTime sx={{ fontSize: 16 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(watch.watchedAt)}
                                </Typography>
                              </Box>
                              {watch.watchDuration > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <VideoLibrary sx={{ fontSize: 16 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDuration(watch.watchDuration)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < history.watchHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Clear History Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>
          Clear History
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear {clearType === 'all' ? 'all' : clearType} history for {childName}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClearHistory} color="error" variant="contained">
            Clear History
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChildHistory; 