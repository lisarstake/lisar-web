/**
 * Confirmation Drawer Component
 * Shows confirmation messages in a drawer for actions like delete
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
import { AlertTriangle } from "lucide-react";

interface ConfirmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export const ConfirmDrawer: React.FC<ConfirmDrawerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-white border-gray-200">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`w-12 h-12 ${
                variant === "danger" ? "bg-red-500/10" : "bg-yellow-500/10"
              } rounded-full flex items-center justify-center`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  variant === "danger" ? "text-red-500" : "text-yellow-500"
                }`}
              />
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
            onClick={handleConfirm}
            className={`w-full py-2.5 px-6 rounded-lg font-semibold text-lg ${
              variant === "danger"
                ? "bg-red-700 text-white hover:bg-red-600"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
            } transition-colors`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-lg font-semibold text-lg border-2 border-[#235538] bg-transparent text-[#235538] hover:bg-[#1d4530] hover:text-white transition-colors"
          >
            {cancelText}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

