import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface WithdrawActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNaira: () => void;
  onSelectCrypto: () => void;
  walletIcon: string;
}

export const WithdrawActionDrawer: React.FC<WithdrawActionDrawerProps> = ({
  isOpen,
  onClose,
  onSelectNaira,
  onSelectCrypto,
  walletIcon,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-white text-base font-medium text-left">
            Withdraw method
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
                <p className="text-white text-sm font-medium">Bank/Mobile Money</p>
                <p className="text-xs text-white/60">
                  Withdraw to your bank account
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
                <p className="text-white text-sm font-medium">Onchain Withdrawal</p>
                <p className="text-xs text-white/60">
                  Send to an external wallet address
                </p>
              </div>
            </div>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
