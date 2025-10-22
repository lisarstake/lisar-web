import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  content: string[];
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  content,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-2xl font-bold text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-center text-white/70 text-base">
            {subtitle}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 space-y-6">
          {content.map((section, index) => (
            <div key={index}>
              <p className="text-white text-sm leading-relaxed">{section}</p>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
          >
            Got it
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
