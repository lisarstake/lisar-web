/**
 * Error Drawer Component
 * Shows error messages in a drawer similar to success screens
 */

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";
import { AlertCircle } from "lucide-react";

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
  retryText = "Try Again",
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-white border-gray-200">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <DrawerTitle className="text-lg font-bold text-gray-900">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-gray-600 text-sm">
            {message}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="space-y-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-lg font-semibold text-lg border-2 border-[#235538] bg-transparent text-[#235538] hover:bg-[#1d4530] hover:text-white transition-colors"
          >
            Close
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
