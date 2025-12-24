import React, { useEffect } from 'react';

const PWAImagePreloader: React.FC = () => {
  useEffect(() => {
    // Preload favicon for better performance
    const preloadImages = () => {
      const img = new Image();
      img.src = '/lisar.png';
    };

    // Preload images after a short delay to not block initial render
    const timer = setTimeout(preloadImages, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default PWAImagePreloader;
