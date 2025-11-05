import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { isPWA, getPWADisplayMode, canInstallPWA, getPlatform } from '../../lib/pwa';

const PWAStatus: React.FC = () => {
  const [pwaStatus, setPwaStatus] = useState({
    isPWA: false,
    displayMode: 'unknown',
    canInstall: false,
    serviceWorker: false,
    platform: 'unknown'
  });

  useEffect(() => {
    const checkPWAStatus = () => {
      setPwaStatus({
        isPWA: isPWA(),
        displayMode: getPWADisplayMode(),
        canInstall: canInstallPWA(),
        serviceWorker: 'serviceWorker' in navigator,
        platform: getPlatform()
      });
    };

    checkPWAStatus();
    // Check again when display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);

    return () => mediaQuery.removeEventListener('change', checkPWAStatus);
  }, []);

  if (!pwaStatus.isPWA) {
    return null; // Only show in PWA mode or during development
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Smartphone className="w-4 h-4 text-green-600" />
        <span className="text-sm font-semibold">PWA Status</span>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>Display Mode:</span>
          <span className="font-medium">{pwaStatus.displayMode}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Can Install:</span>
          {pwaStatus.canInstall ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>Service Worker:</span>
          {pwaStatus.serviceWorker ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>Platform:</span>
          <span className="font-medium capitalize">{pwaStatus.platform}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Running as Progressive Web App
        </p>
      </div>
    </div>
  );
};

export default PWAStatus;
