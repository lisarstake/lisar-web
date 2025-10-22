import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed using multiple methods
    const checkInstallation = () => {
      // Check PWA display modes
      if (window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches) {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      
      // Check iOS standalone
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      
      // Check localStorage for previous installation
      if (localStorage.getItem('pwa-installed') === 'true') {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };
    
    if (checkInstallation()) {
      return;
    }

    // Check if iOS and show manual install instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Check if iOS PWA is already installed
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return;
      }
      
      // Check localStorage for previous iOS installation
      if (localStorage.getItem('pwa-installed') === 'true') {
        setIsInstalled(true);
        return;
      }
      
      // Check if user has dismissed the iOS prompt recently (24 hour cooldown)
      const lastDismissed = localStorage.getItem('pwa-ios-dismissed');
      if (lastDismissed) {
        const timeSinceDismissed = Date.now() - parseInt(lastDismissed);
        if (timeSinceDismissed < 24 * 60 * 60 * 1000) { // 24 hours
          return; // Don't show prompt yet
        }
      }
      
      // For iOS, show the prompt after a delay to guide users
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
      // Check if user recently dismissed the prompt
      const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
      const androidDismissed = localStorage.getItem('pwa-android-dismissed');
      
      if (lastDismissed) {
        const timeSinceDismissed = Date.now() - parseInt(lastDismissed);
        const hoursSinceDismissed = timeSinceDismissed / (1000 * 60 * 60);
        
        // Don't show again for 24 hours if dismissed
        if (hoursSinceDismissed < 24) {
          console.log('PWA prompt recently dismissed, not showing again');
          return;
        }
      }
      
      // For Android, check if they specifically dismissed the Android prompt
      if (androidDismissed) {
        const timeSinceAndroidDismissed = Date.now() - parseInt(androidDismissed);
        const hoursSinceAndroidDismissed = timeSinceAndroidDismissed / (1000 * 60 * 60);
        
        if (hoursSinceAndroidDismissed < 24) {
          console.log('Android PWA prompt recently dismissed, not showing again');
          return;
        }
      }
      
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
      console.log('PWA installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Show iOS-specific instructions
      alert('To install Lisar on your home screen:\n\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
      setShowPrompt(false);
      // Mark as dismissed for iOS with timestamp
      localStorage.setItem('pwa-ios-dismissed', Date.now().toString());
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
    
    // Store dismissal to prevent showing again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    
    // For Android, if they dismiss, don't show again for 24 hours
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isAndroid) {
      localStorage.setItem('pwa-android-dismissed', Date.now().toString());
    }
  };

  // Don't show if already installed
  if (isInstalled || !showPrompt) {
    return null;
  }
  
  // For iOS, always show the prompt
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    // Show iOS install prompt
  } else if (!deferredPrompt) {
    // For Android/Chrome, only show if we have the prompt
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            {isIOS ? 'Add to Home Screen' : 'Install Lisar App'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isIOS 
              ? 'Install Lisar on your home screen for quick access' 
              : 'Add to your home screen for quick access and better experience'
            }
          </p>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-3 flex gap-2">
        <Button
          onClick={handleInstallClick}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2"
        >
          <Download className="w-4 h-4 mr-2" />
          {isIOS ? 'Add to Home' : 'Install'}
        </Button>
        
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex-1 text-sm py-2"
        >
          Later
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
