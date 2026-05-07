import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CheckCheck } from "lucide-react";

interface SettingsSuccessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const SettingsSuccessDrawer: React.FC<SettingsSuccessDrawerProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#050505] border-[#505050]">
        <DrawerHeader className="text-center">
          <div className="bg-[#151515] mx-auto my-3 flex h-18 w-18 items-center justify-center rounded-full">
            <CheckCheck className="text-[#C7EF6B]" size={34} />
          </div>
          <DrawerTitle className="text-base font-medium text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-white/80">
            {message}
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter>
          <button
            onClick={onClose}
            className="py-3 w-full rounded-full bg-[#C7EF6B] text-black text-base font-medium"
          >
            Done
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
