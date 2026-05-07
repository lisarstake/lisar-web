import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface AllBalancesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ngnBalance: number;
  lptBalance: number;
  usdcBalance: number;
  showBalance: boolean;
}

export const AllBalancesDrawer: React.FC<AllBalancesDrawerProps> = ({
  isOpen,
  onClose,
  ngnBalance,
  lptBalance,
  usdcBalance,
  showBalance,
}) => {
  const formatBalance = (value: number, decimals = 2, symbol = "") => {
    if (!showBalance) return "****";
    return `${symbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505]">
        <DrawerHeader className="mb-2">
          <DrawerTitle className="font-medium text-base text-white text-start">
            All balances
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-2 space-y-3 pb-2 px-1">
          <div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#151515]">
                <img src="/usdc.svg" alt="USDC" className="w-8 h-8" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">USD Coin</p>
                  <p className="text-white/50 text-xs">USDC</p>
                </div>
                <p className="text-white text-sm font-medium">
                  {formatBalance(usdcBalance, 2, "$")}
                </p>
              </div>
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#151515]">
                <img src="/livepeer.webp" alt="LPT" className="w-8 h-8" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Livepeer</p>
                  <p className="text-white/50 text-xs">LPT</p>
                </div>
                <p className="text-white text-sm font-medium">
                  {formatBalance(lptBalance, 2)}
                </p>
              </div>
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#151515]">
                <img
                  src="/ng_flag.png"
                  alt="NGN"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Naira</p>
                  <p className="text-white/50 text-xs">NGN</p>
                </div>
                <p className="text-white text-sm font-medium">
                  {formatBalance(ngnBalance, 2, "₦")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
