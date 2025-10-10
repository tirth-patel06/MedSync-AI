import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const CalendarSyncContext = createContext();

export const useCalendarSync = () => useContext(CalendarSyncContext);

export const CalendarSyncProvider = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState({
    isLinked: false,
    syncEnabled: false,
    lastSync: null,
    isSyncing: false
  });

  const [localuser] = useState(() => {
    try {
      const stored = localStorage.getItem("user"); 
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
      return null;
    }
  });

  // Check calendar sync status
  const checkSyncStatus = useCallback(async () => {
    if (!localuser?.id) return;
    
    try {
      const response = await axios.post('http://localhost:8080/api/calendar/status', { localuser });
      if (response.data && response.data.success) {
        setSyncStatus(prev => ({
          ...prev,
          isLinked: response.data.isLinked,
          syncEnabled: response.data.syncEnabled,
          lastSync: response.data.lastSync
        }));
        return response.data;
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLinked: false,
        syncEnabled: false
      }));
    }
  }, [localuser]);

  // Sync medications to Google Calendar
  const syncToCalendar = useCallback(async () => {
    if (!localuser?.id) {
      throw new Error("User not logged in");
    }
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const response = await axios.post('http://localhost:8080/api/calendar/sync', { localuser });
      
      if (response.data && response.data.success) {
        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          syncEnabled: true,
          lastSync: new Date().toISOString()
        }));
        
        return {
          success: true,
          message: response.data.message,
          syncedMedications: response.data.syncedMedications,
          syncedEvents: response.data.syncedEvents,
          details: response.data.syncDetails
        };
      } else {
        throw new Error(response.data?.message || 'Sync failed');
      }
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      console.error('Calendar sync error:', error);
      throw error;
    }
  }, [localuser]);

  // Connect to Google Calendar (redirect to OAuth)
  const connectCalendar = useCallback(() => {
    if (!localuser?.id) {
      alert("Please log in first");
      return;
    }
    
    // Redirect to OAuth login endpoint
    window.location.href = `http://localhost:8080/api/oauth/login?userId=${localuser.id}`;
  }, [localuser]);

  const value = {
    syncStatus,
    checkSyncStatus,
    syncToCalendar,
    connectCalendar,
    setSyncStatus
  };

  return (
    <CalendarSyncContext.Provider value={value}>
      {children}
    </CalendarSyncContext.Provider>
  );
};