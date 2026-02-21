import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </NotificationContext.Provider>
  );
};

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6"
  };

  return (
    <div 
      className="notification animate-slide-in"
      style={{
        position: 'fixed', top: '24px', right: '24px', padding: '16px 24px',
        borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: 1000, maxWidth: '400px', background: bgColors[type] || bgColors.info, color: 'white'
      }}
    >
      {message}
    </div>
  );
};