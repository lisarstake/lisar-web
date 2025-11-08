// PWA Service Worker Registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
     
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
             
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
    
    }
  }
};

// Check if app is running as PWA
export const isPWA = (): boolean => {
  // Check if running in standalone mode (installed as PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if running in minimal-ui mode (also considered installed)
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true;
  }
  
  // Check if running in fullscreen mode (also considered installed)
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }
  
  // Check iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Check if launched from Android app launcher
  if (document.referrer.includes('android-app://')) {
    return true;
  }
  
  // Check if running in PWA mode on iOS (no Safari UI)
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Check if viewport is full screen (no Safari UI)
    const viewport = (window as any).visualViewport;
    if (viewport && viewport.height === window.innerHeight) {
      return true;
    }
    
    // Check if status bar is hidden (indicates PWA mode)
    if (window.innerHeight === window.screen.height) {
      return true;
    }
  }
  
  return false;
};

// Detect platform for PWA optimization
export const getPlatform = (): 'android' | 'ios' | 'windows' | 'other' => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/android/.test(userAgent)) {
    return 'android';
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/windows/.test(userAgent)) {
    return 'windows';
  }
  
  return 'other';
};

// Get platform-specific icon path
export const getPlatformIcon = (size: number): string => {
  const platform = getPlatform();
  
  switch (platform) {
    case 'android':
      if (size <= 48) return '/android/android-launchericon-48-48.png';
      if (size <= 72) return '/android/android-launchericon-72-72.png';
      if (size <= 96) return '/android/android-launchericon-96-96.png';
      if (size <= 144) return '/android/android-launchericon-144-144.png';
      if (size <= 192) return '/android/android-launchericon-192-192.png';
      return '/android/android-launchericon-512-512.png';
      
    case 'ios':
      if (size <= 60) return '/ios/60.png';
      if (size <= 76) return '/ios/76.png';
      if (size <= 120) return '/ios/120.png';
      if (size <= 152) return '/ios/152.png';
      if (size <= 180) return '/ios/180.png';
      if (size <= 192) return '/ios/192.png';
      return '/ios/512.png';
      
    case 'windows':
      if (size <= 44) return '/windows11/Square44x44Logo.scale-100.png';
      if (size <= 150) return '/windows11/Square150x150Logo.scale-100.png';
      return '/windows11/LargeTile.scale-100.png';
      
    default:
      return '/android/android-launchericon-192-192.png';
  }
};

// Get PWA display mode
export const getPWADisplayMode = (): string => {
  if (isPWA()) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  return 'browser';
};

// PWA installation utilities
export const canInstallPWA = (): boolean => {
  return 'BeforeInstallPromptEvent' in window;
};

// Check if PWA is already installed
export const isPWAInstalled = (): boolean => {
  // Check if running in any PWA mode
  if (isPWA()) {
    return true;
  }
  
  // Check if there's a service worker controlling the page
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    return true;
  }
  
  // Check localStorage for installation status
  const installStatus = localStorage.getItem('pwa-installed');
  if (installStatus === 'true') {
    return true;
  }
  
  return false;
};

// Show PWA install prompt
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!canInstallPWA()) return false;
  
  // This will be handled by the PWAInstallPrompt component
  // which listens for the beforeinstallprompt event
  return true;
};
