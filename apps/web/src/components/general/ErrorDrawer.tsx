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
} from '../ui/drawer';
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
      <DrawerContent className="bg-[#050505] border-[#505050]">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-0">
            <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full my-3 flex items-center justify-center relative overflow-hidden">
              <img
                src="/error.png"
                alt="Error"
                className="w-13 h-13 object-cover"
              />
            </div>
          </div>
          <DrawerTitle className="text-base font-medium text-white/90">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-gray-400 text-sm">
            {message}
          </DrawerDescription>

        </DrawerHeader>

        <DrawerFooter className="space-y-3">

          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-[#C7EF6B] text-black text-base font-medium"
          >
            Close
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

