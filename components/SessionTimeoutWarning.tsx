'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface SessionTimeoutWarningProps {
  warningTimeMinutes?: number;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({ 
  warningTimeMinutes = 5 
}) => {
  const { isAuthenticated, token } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setShowWarning(false);
      return;
    }

    // Decode JWT token to get expiration time
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const warningTime = warningTimeMinutes * 60 * 1000; // Convert to milliseconds
      
      const checkSession = () => {
        const now = Date.now();
        const timeUntilExpiry = expirationTime - now;
        
        if (timeUntilExpiry <= warningTime && timeUntilExpiry > 0) {
          setShowWarning(true);
          setTimeLeft(Math.ceil(timeUntilExpiry / 1000 / 60)); // Convert to minutes
        } else if (timeUntilExpiry <= 0) {
          setShowWarning(false);
        } else {
          setShowWarning(false);
        }
      };

      // Check immediately
      checkSession();

      // Check every minute
      const interval = setInterval(checkSession, 60000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }, [isAuthenticated, token, warningTimeMinutes]);

  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      toast.warning(`Your session will expire in ${timeLeft} minute${timeLeft !== 1 ? 's' : ''}`, {
        duration: 10000,
        action: {
          label: 'Extend Session',
          onClick: () => {
            // Refresh the page to get a new token
            window.location.reload();
          }
        }
      });
    }
  }, [showWarning, timeLeft]);

  return null; // This component doesn't render anything visible
};

export default SessionTimeoutWarning;
