/**
 * Email Confirmation Drawer Component
 * Shows success message after signup with email confirmation instructions
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
import { Mail, CheckCircle } from "lucide-react";

interface EmailConfirmationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const EmailConfirmationDrawer: React.FC<
  EmailConfirmationDrawerProps
> = ({ isOpen, onClose, email }) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#121212] border-[#2a2a2a]">
        <DrawerHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#C7EF6B]/10 rounded-full flex items-center justify-center relative">
              <Mail className="w-8 h-8 text-[#C7EF6B]" />
              <CheckCircle className="w-5 h-5 text-[#C7EF6B] absolute -top-1 -right-1 bg-[#121212] rounded-full" />
            </div>
          </div>
          <DrawerTitle className="text-xl font-bold text-white">
            Check Your Email
          </DrawerTitle>
          <DrawerDescription className="text-gray-400 text-base mt-2">
            We've sent you a confirmation email
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
          >
            Got it
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
