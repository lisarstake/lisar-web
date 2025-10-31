import React, { useEffect } from 'react';

const PWAImagePreloader: React.FC = () => {
  useEffect(() => {
    // Preload critical PWA images for better performance
    const preloadImages = () => {
      const imageUrls = [
        // Android icons
        '/android/android-launchericon-192-192.png',
        '/android/android-launchericon-512-512.png',
        // iOS icons
        '/ios/180.png',
        '/ios/192.png',
        // Windows icons
        '/windows11/Square44x44Logo.scale-100.png',
        '/windows11/Square150x150Logo.scale-100.png'
      ];

      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    // Preload images after a short delay to not block initial render
    const timer = setTimeout(preloadImages, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default PWAImagePreloader;
