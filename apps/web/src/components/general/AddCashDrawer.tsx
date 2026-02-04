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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-left text-lg font-medium text-white/80">
            Where?
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-4 space-y-3">
          <button
            onClick={() => onSelectDestination("savings")}
            className="w-full flex items-center py-1 pr-3 pl-1 rounded-lg bg-[#121212] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <img
              src="/highyield-3.svg"
              alt="Stables"
              className="w-12 h-12 object-contain"
            />
            <span className="flex-1 text-gray-300 text-base font-medium">
              Savings
            </span>
            <ChevronRight size={18} className="text-gray-500" />
          </button>

          <button
            onClick={() => onSelectDestination("growth")}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-lg bg-[#121212] hover:bg-[#151515] transition-colors text-left shadow-md shadow-black/20"
          >
            <img
              src="/highyield-1.svg"
              alt="High Yield"
              className="w-8 h-8"
            />
            <span className="flex-1 text-gray-300 text-base font-medium">
              Growth
            </span>
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
