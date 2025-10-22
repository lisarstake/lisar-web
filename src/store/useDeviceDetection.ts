import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check screen width (mobile typically < 768px)
      const isMobileWidth = window.innerWidth < 768;
      
      // Check user agent for mobile devices
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Consider it desktop if both conditions are false
      setIsDesktop(!isMobileWidth && !isMobileUserAgent);
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return { isDesktop };
};
