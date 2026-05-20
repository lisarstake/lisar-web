import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface GrowthActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGrowing: () => void;
  onMoveStake: () => void;
}

export const GrowthActionDrawer: React.FC<GrowthActionDrawerProps> = ({
  isOpen,
  onClose,
  onStartGrowing,
  onMoveStake,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-white text-base font-medium text-left">
            Growth method
          </DrawerTitle>
        </DrawerHeader>

        <div className="pb-2 space-y-3">
          <button
            onClick={onStartGrowing}
            className="w-full rounded-xl bg-[#151515] px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="/grow.png"
                alt="Start growing"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-white text-sm font-medium">Start growing</p>
                <p className="text-xs text-white/60">
                  Start growing to begin earning rewards
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onMoveStake}
            className="w-full rounded-xl bg-[#151515] px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <img
                src="/move.jpeg"
                alt="Move stake"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-white text-sm font-medium">Move balance</p>
                <p className="text-xs text-white/60">
                  Move your balance to a different orchestrator
                </p>
              </div>
            </div>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
