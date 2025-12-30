/**
 * Success Drawer Component
 * Shows success messages in a drawer similar to error screens
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
import { CheckCircle } from 'lucide-react';

interface SuccessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
  onAction?: () => void;
  actionText?: string;
}

export const SuccessDrawer: React.FC<SuccessDrawerProps> = ({
  isOpen,
  onClose,
  title = "Success!",
  message,
  details,
  onAction,
  actionText = "Continue"
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#121212] border-[#2a2a2a]">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#C7EF6B]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#C7EF6B]" />
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
            className="w-full py-3 px-6 rounded-lg font-semibold text-lg border-2 border-[#C7EF6B] bg-transparent text-[#C7EF6B] hover:bg-[#C7EF6B] hover:text-black transition-colors"
          >
            Close
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
