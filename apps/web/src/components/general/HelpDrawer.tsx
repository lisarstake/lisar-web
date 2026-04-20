import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string[];
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({
  isOpen,
  onClose,
  title,
  content,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505] border-[#505050]">
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            {title}
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-4 space-y-1">
          {content.map((section, index) => (
            <div key={index}>
              <p className="text-gray-300 text-sm leading-relaxed">{section}</p>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-[#C7EF6B] text-black text-base font-semibold"
          >
            Got it
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
