import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface DepositActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNaira: () => void;
  onSelectCrypto: () => void;
  walletCoinName: string;
  walletIcon: string;
}

export const DepositActionDrawer: React.FC<DepositActionDrawerProps> = ({
  isOpen,
  onClose,
  onSelectNaira,
  onSelectCrypto,
  walletCoinName,
  walletIcon,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-white text-base font-medium text-left">
            Deposit method
          </DrawerTitle>
        </DrawerHeader>

        <div className="pb-2 space-y-3">
          <button
            onClick={onSelectNaira}
            className="w-full rounded-xl bg-[#151515] px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <img src="/ng_flag.png" alt="Naira" className="w-10 h-10" />
              <div>
                <p className="text-white text-sm font-medium">Naira Deposit</p>
                <p className="text-xs text-white/60">
                  Deposit to your Lisar wallet
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onSelectCrypto}
            className="w-full rounded-xl bg-[#151515] px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <img src={walletIcon} alt="Crypto" className="w-10 h-10" />
              <div>
                <p className="text-white text-sm font-medium">
                  Onchain Deposit
                </p>
                <p className="text-xs text-white/60">
                  Deposit from an external wallet
                </p>
              </div>
            </div>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
