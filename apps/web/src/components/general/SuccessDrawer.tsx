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
} from '../ui/drawer';
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
      <DrawerContent className="bg-[#050505] border-[#505050]">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-0">
            <div className="w-20 h-20 bg-[#C7EF6B]/20 rounded-full my-3 flex items-center justify-center relative overflow-hidden">
              <img
                src="/fund.png"
                alt="Error"
                className="w-15 h-15 object-cover"
              />
            </div>
          </div>
          <DrawerTitle className="text-base font-medium text-white/90">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-gray-400 text-sm px-6">
            {message}
          </DrawerDescription>

        </DrawerHeader>

        <DrawerFooter className="space-y-3">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-[#C7EF6B] text-black text-base font-semibold"
          >
            Close
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
