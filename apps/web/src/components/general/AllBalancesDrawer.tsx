import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Wallet, TrendingUp, PiggyBank, Sprout, WalletCards } from "lucide-react";

interface AllBalancesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stashBalance: number;
  savingsBalance: number;
  growthBalance: number;
  showBalance: boolean;
  currencySymbol: string;
}

export const AllBalancesDrawer: React.FC<AllBalancesDrawerProps> = ({
  isOpen,
  onClose,
  stashBalance,
  savingsBalance,
  growthBalance,
  showBalance,
  currencySymbol,
}) => {
  const formatBalance = (value: number, decimals = 2) => {
    if (!showBalance) return "****";
    return `${currencySymbol}${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505]">
        <DrawerHeader className="mb-2">
          <DrawerTitle className="font-medium text-base text-white text-start">
            Your Balances
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-2 space-y-3 pb-2 px-1">
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#151515]">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <WalletCards size={20} className="text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-base font-medium">Stash</p>
              </div>
              <p className="text-white/80 text-sm font-medium">
                {formatBalance(stashBalance)}
              </p>
            </div>

            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#151515]">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <PiggyBank size={20} className="text-white/70"  />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-base font-medium">Savings</p>
              </div>
              <p className="text-white/80 text-sm font-medium">
                {formatBalance(savingsBalance)}
              </p>
            </div>

            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#151515]">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Sprout size={20} className="text-white/70"  />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-base font-medium">Growth</p>
              </div>
              <p className="text-white/80 text-sm font-medium">
                {formatBalance(growthBalance)}
              </p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
