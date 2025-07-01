import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SubProfileContext = createContext();

export const useSubProfile = () => {
  const context = useContext(SubProfileContext);
  if (!context) {
    throw new Error('useSubProfile must be used within a SubProfileProvider');
  }
  return context;
};

export const SubProfileProvider = ({ children }) => {
  const [subProfiles, setSubProfiles] = useState([]);
  const [currentSubProfile, setCurrentSubProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSubProfiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/subprofiles');
      setSubProfiles(response.data);
      
      // Set first sub-profile as current if none selected
      if (response.data.length > 0 && !currentSubProfile) {
        setCurrentSubProfile(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching sub-profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubProfiles();
    }
  }, [user]);

  const addSubProfile = async (name, avatar) => {
    try {
      const response = await axios.post('http://localhost:5000/api/subprofiles', {
        name,
        avatar,
      });
      setSubProfiles([...subProfiles, response.data]);
      return { success: true, subProfile: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add sub-profile' };
    }
  };

  const updateSubProfile = async (subProfileId, name, avatar) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/subprofiles/${subProfileId}`, {
        name,
        avatar,
      });
      setSubProfiles(subProfiles.map(sp => 
        sp._id === subProfileId ? response.data : sp
      ));
      if (currentSubProfile?._id === subProfileId) {
        setCurrentSubProfile(response.data);
      }
      return { success: true, subProfile: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update sub-profile' };
    }
  };

  const deleteSubProfile = async (subProfileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/subprofiles/${subProfileId}`);
      setSubProfiles(subProfiles.filter(sp => sp._id !== subProfileId));
      
      // If deleted sub-profile was current, set first available as current
      if (currentSubProfile?._id === subProfileId) {
        const remaining = subProfiles.filter(sp => sp._id !== subProfileId);
        setCurrentSubProfile(remaining.length > 0 ? remaining[0] : null);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete sub-profile' };
    }
  };

  const value = {
    subProfiles,
    currentSubProfile,
    setCurrentSubProfile,
    addSubProfile,
    updateSubProfile,
    deleteSubProfile,
    fetchSubProfiles,
    loading,
  };

  return (
    <SubProfileContext.Provider value={value}>
      {children}
    </SubProfileContext.Provider>
  );
}; 