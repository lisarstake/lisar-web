import React from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { X } from "lucide-react";

interface PerksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore?: () => void;
  buttonText?: string;
}

export const PerksDrawer: React.FC<PerksDrawerProps> = ({
  isOpen,
  onClose,
  onExplore,
  buttonText = "Explore perks",
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="bg-[#0b0b0b] border-t border-[#1f1f1f] rounded-t-[30px]">
        <div className="px-5 pt-2 pb-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#151515] border border-[#2a2a2a] text-white flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
          <h3 className="text-[#C7EF6B] text-[20px] leading-[1.05] font-semibold mt-2">
            Introducing Perks ⭐
          </h3>
          <p className="text-white/70 text-sm mt-2">
            Unlock exclusive discounts across different services when you save, up to 20% OFF!
          </p>
          <img
            src="/card1.png"
            alt="SPAR promo"
            className="w-full rounded-lg mt-8 object-cover border border-[#86B3F7]/30"
          />
          <button
            onClick={() => {
              onClose();
              onExplore?.();
            }}
            className="w-full mt-8 bg-[#C7EF6B] text-black rounded-full py-2.5 text-lg font-medium hover:bg-[#96C3F7] transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
