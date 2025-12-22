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
  image?: string;
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
  image,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex justify-center mb-2">
            {image ? (
              <img
                src={image}
                alt="Confirmation"
                className="w-28 h-28 object-contain"
              />
            ) : (
              <div
                className={`w-12 h-12 ${
                  variant === "danger" ? "bg-red-500/10" : "bg-yellow-500/10"
                } rounded-full flex items-center justify-center`}
              >
                <AlertTriangle
                  className={`w-10 h-10 ${
                    variant === "danger" ? "text-red-400" : "text-yellow-400"
                  }`}
                />
              </div>
            )}
          </div>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {message}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter>
          <button
            onClick={handleConfirm}
            className={`w-full py-2.5 rounded-lg font-semibold text-lg transition-colors ${
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-[#C7EF6B] text-black hover:bg-yellow-500"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-semibold text-lg bg-[#2a2a2a] text-white hover:bg-[#3a3a3a] transition-colors"
          >
            {cancelText}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
