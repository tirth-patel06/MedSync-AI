import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // ── JWT guard ────────────────────────────────────────────────────────
    // Don't attempt a socket connection without a valid token —
    // this is what caused the WebSocket auth errors.
    const token = localStorage.getItem("token");
    const tokenValid =
      token &&
      token !== "null" &&
      token !== "undefined" &&
      token.trim() !== "";

    if (!tokenValid) {
      console.warn("SocketProvider: no valid token found, skipping connection.");
      return;
    }
    // ────────────────────────────────────────────────────────────────────

    // Connect to WebSocket server (token is read inside socketService.connect)
    socketService.connect();

    // Listen for connection status changes
    const checkConnection = () => {
      setConnected(socketService.isConnected());
    };

    // Set up notification listener
    const unsubscribe = socketService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
        });
      }
    });

    // Check connection status periodically
    const interval = setInterval(checkConnection, 1000);

    // Load existing notifications
    setNotifications(socketService.getNotifications());

    return () => {
      clearInterval(interval);
      unsubscribe();
      socketService.disconnect();
    };
  }, []); // re-runs on mount; token is checked at that point

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    socketService.clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    socketService.removeNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (unreadCount > 0) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const value = {
    notifications,
    connected,
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    socketService
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};