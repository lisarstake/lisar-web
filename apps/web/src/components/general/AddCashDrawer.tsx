import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChevronRight } from "lucide-react";

interface AddCashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAmount: number | null;
  onSelectDestination: (destination: "savings" | "growth") => void;
}

export const AddCashDrawer: React.FC<AddCashDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDestination,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505]">
        <DrawerHeader className="mb-7">
          <DrawerTitle className="absolute left-1/2 -translate-x-1/2 font-medium text-lg text-white">
            Where?
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-2 space-y-3 pb-6">
          <button
            onClick={() => onSelectDestination("savings")}
            className="w-full flex items-center py-1 pr-3 pl-1 rounded-lg bg-[#13170a] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <img
              src="/highyield-3.svg"
              alt="Stables"
              className="w-12 h-12 object-contain"
            />
            <span className="flex-1 text-white text-base font-medium">
              Savings
            </span>
            <ChevronRight size={18} className="text-white/50" />
          </button>

          <button
            onClick={() => onSelectDestination("growth")}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg bg-[#13170a] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <img src="/highyield-1.svg" alt="High Yield" className="w-8 h-8" />
            <span className="flex-1 text-white text-base font-medium">
              Growth
            </span>
            <ChevronRight size={18} className="text-white/50" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
