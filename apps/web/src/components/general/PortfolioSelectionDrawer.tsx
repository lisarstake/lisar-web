import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChevronRight, WalletCards, Weight } from "lucide-react";

interface PortfolioSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (portfolio: "savings" | "growth") => void;
}

export const PortfolioSelectionDrawer: React.FC<
  PortfolioSelectionDrawerProps
> = ({ isOpen, onClose, onSelect }) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505]">
        <DrawerHeader className="mb-2">
          <DrawerTitle className="font-medium text-base text-white/70 text-start flex items-center gap-1">
          <WalletCards size={16}/> Which balance? 
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-2 space-y-3 pb-2">
          <button
            onClick={() => onSelect("savings")}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg bg-[#151515] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <span className="flex-1 text-white/90 text-base">
              Savings
            </span>
            <ChevronRight size={18} className="text-white/50" />
          </button>
          {/* <button
            onClick={() => onSelect("flex")}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg bg-[#151515] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <span className="flex-1 text-white/90 text-base">
              Flex
            </span>
            <ChevronRight size={18} className="text-white/50" />
          </button> */}
          <button
            onClick={() => onSelect("growth")}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg bg-[#151515] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <span className="flex-1 text-white/90 text-base">
              Growth
            </span>
            <ChevronRight size={18} className="text-white/50" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
