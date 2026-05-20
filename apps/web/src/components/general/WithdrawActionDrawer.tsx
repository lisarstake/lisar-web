import React from "react";
import toast from "react-hot-toast";
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
  walletType?: string;
  onSelectRedeem?: () => void;
  onSelectClaim?: () => void;
  disableRedeem?: boolean;
  disableClaim?: boolean;
  claimAmount?: number;
}

export const WithdrawActionDrawer: React.FC<WithdrawActionDrawerProps> = ({
  isOpen,
  onClose,
  onSelectNaira,
  onSelectCrypto,
  walletIcon,
  walletType,
  onSelectRedeem,
  onSelectClaim,
  disableRedeem,
  disableClaim,
  claimAmount,
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
          {walletType === "staking" && (
            <>
              <p className="text-xs font-medium text-white/40 px-1 pt-1">
                Internal
              </p>

              <button
                onClick={() => {
                  if (disableRedeem) {
                    toast.error("Not enough LPT to unbond");
                    return;
                  }
                  onSelectRedeem?.();
                }}
                className="w-full rounded-xl bg-[#151515] px-4 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <img src="/redeem.jpeg" alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-white text-sm font-medium">Unbond Balance</p>
                    <p className="text-xs text-white/60">
                      Unlock your bonded balance
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (disableClaim) {
                    toast.error("No unbonded LPT to claim");
                    return;
                  }
                  onSelectClaim?.();
                }}
                className="w-full rounded-xl bg-[#151515] px-4 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <img src="/claim.jpeg" alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-white text-sm font-medium">Withdraw Unbonded</p>
                    <p className="text-xs text-white/60">
                      {!disableClaim && claimAmount ? `Claim ${claimAmount.toLocaleString()} LPT` : "Claim your unlocked balance"}
                    </p>
                  </div>
                </div>
              </button>
            </>
          )}

          {walletType === "staking" && <p className="text-xs font-medium text-white/40 px-1 pt-1">
            External 
          </p>}

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
