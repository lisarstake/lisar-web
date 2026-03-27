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
} from "@/components/ui/drawer";
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
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex justify-center mb-4">
            <div
              className={`w-12 h-12 ${
                variant === "danger" ? "bg-red-500/10" : "bg-yellow-500/10"
              } rounded-full flex items-center justify-center`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  variant === "danger" ? "text-red-400" : "text-yellow-400"
                }`}
              />
            </div>
          </div>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-center text-sm">
            {message}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter>
          <button
            onClick={handleConfirm}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-yellow-600 text-white hover:bg-yellow-500"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-colors"
          >
            {cancelText}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

