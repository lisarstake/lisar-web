import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";
import { useGrow } from "@/contexts/GrowContext";
import { GrowLoader } from "./GrowLoader";

interface GrowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: () => void;
}

export const GrowDrawer: React.FC<GrowDrawerProps> = ({
  isOpen,
  onClose,
  onLaunch,
}) => {
  const { setGrowMode, setLoading } = useGrow();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset checkbox when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setAgreedToTerms(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleLaunch = () => {
    if (agreedToTerms && !isLoading) {
      setIsLoading(true);
      setLoading(true); 

      // Show loading for 3 seconds
      setTimeout(() => {
        setIsLoading(false);
        setLoading(false);
        setGrowMode(true);
        onLaunch();
        setAgreedToTerms(false);
      }, 3000);
    }
  };

  return (
    <>
      <GrowLoader isVisible={isLoading} />

      <Drawer
        open={isOpen && !isLoading}
        onOpenChange={(open) => !open && onClose()}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{/* {title} */}</DrawerTitle>
          </DrawerHeader>
          <div className="pt-4 space-y-6">
            {/* Grow Image */}
            <div className="flex justify-center">
              <img
                src="/grow1.png"
                alt="Grow"
                className="w-full max-w-[180px] h-auto object-contain"
              />
            </div>

            {/* Disclaimer */}
            <div className="space-y-4">
              <p className="text-gray-300 text-sm ">
                Put your balance to work and earn rewards, subject to terms and
                conditions.
              </p>

              {/* Checkbox */}
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                  className="w-3.5 h-3.5 text-[#C7EF6B] bg-[#1a1a1a] border-[#2a2a2a] rounded"
                />
                <span className="text-gray-300 text-sm">
                  I agree to the terms and conditions
                </span>
              </label>
            </div>
          </div>

          <DrawerFooter>
            <button
              onClick={handleLaunch}
              disabled={!agreedToTerms || isLoading}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition-colors ${
                agreedToTerms && !isLoading
                  ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                  : "bg-[#636363] text-white/50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Launching..." : "Launch Earn"}
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
