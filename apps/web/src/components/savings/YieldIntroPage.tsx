import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, ArrowLeft, Star, Zap } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { YIELD_ASSET_PICKER_PATH } from "@/lib/yieldPaths";

export const YieldIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { stablesBalance } = useWallet();
  const { delegatorStakeProfile } = useDelegation();
  const hasSavings = Boolean(stablesBalance && stablesBalance > 0);
  const hasStaking = Boolean(
    delegatorStakeProfile &&
    parseFloat(delegatorStakeProfile.currentStake || "0") > 0,
  );

  useEffect(() => {
    if (hasSavings) {
      navigate("/wallet/savings", { replace: true });
      return;
    }

    if (hasStaking) {
      navigate("/wallet/staking", { replace: true });
    }
  }, [hasSavings, hasStaking, navigate]);

  const handleExploreClick = () => {
    if (hasSavings) {
      navigate("/wallet/savings");
    } else if (hasStaking) {
      navigate("/wallet/staking");
    } else {
      navigate(YIELD_ASSET_PICKER_PATH);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#071510] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide flex flex-col justify-center">
        <img
          src="/crypto.png"
          alt="Yields"
          className="mx-auto h-[200px] w-[200px] object-contain"
        />

        <h2 className="mt-6 text-xl font-semibold leading-relaxed">
          Earn up to 49% per annum on Lisar Yield
        </h2>

        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-3">
            <Banknote size={18} className="text-[#9f63d5]" />
            <p className="text-sm">Funds are safe and secure</p>
          </div>

          <div className="flex items-center gap-3">
            <Zap size={18} className="text-[#ff4b43]" />
            <p className="text-sm">Withdraw anytime</p>
          </div>

          <div className="flex items-center gap-3">
            <Star size={18} className="text-[#ffb30f]" />
            <p className="text-sm">Zero fees</p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-[#8a938e]">
          Unlimited free withdrawals on all yield plans, withdraw instantly anytime.
        </p>
      </div>

      <div className="px-6 pb-8 pt-3 bg-[#050505] shrink-0">
        <button
          onClick={handleExploreClick}
          className="h-14 w-full rounded-full bg-[#C7EF6B] text-base font-semibold text-black"
        >
          Explore Yield
        </button>
      </div>
    </div>
  );
};
