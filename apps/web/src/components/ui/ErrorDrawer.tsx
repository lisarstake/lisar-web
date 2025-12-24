/**
 * Error Drawer Component
 * Shows error messages in a drawer similar to success screens
 */

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './drawer';
import { AlertCircle } from 'lucide-react';

interface ErrorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorDrawer: React.FC<ErrorDrawerProps> = ({
  isOpen,
  onClose,
  title = "Something went wrong",
  message,
  details,
  onRetry,
  retryText = "Try Again"
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#121212] border-[#2a2a2a]">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <DrawerTitle className="text-lg font-bold text-white/90">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-gray-400 text-sm">
            {message}
          </DrawerDescription>
        
        </DrawerHeader>
        
        <DrawerFooter className="space-y-3">
          
          <button
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-lg font-semibold text-lg border-2 border-[#C7EF6B] bg-transparent text-[#C7EF6B] hover:bg-[#C7EF6B] hover:text-black transition-colors"
          >
            Close
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

