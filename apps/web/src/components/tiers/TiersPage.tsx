import React, { useState } from "react";
import {
  ChevronLeft,
  LockKeyhole,
  CircleQuestionMark,
  Sprout,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { highYieldTiers, stableYieldTiers } from "@/mock";

export const TiersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const locationState = location.state as {
    walletType?: string;
    action?: "deposit" | "withdraw" | "vest";
  } | null;

  const action = locationState?.action || "vest";

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleHighYieldExplore = (tierNumber: number, tierTitle: string) => {
    if (tierNumber === 1) {
      navigate("/validator", {
        state: {
          tierName: tierTitle,
          tierNumber,
          tierTitle,
        },
      });
    }
  };

  const handleStableExplore = (tierNumber: number, tierTitle: string) => {
    const provider = tierNumber === 1 ? "maple" : "perena";

    if (action === "deposit") {
      navigate("/deposit", {
        state: {
          walletType: "savings",
          tierNumber,
          tierTitle,
          provider,
        },
      });
    } else if (action === "withdraw") {
      navigate("/withdraw", {
        state: {
          walletType: "savings",
          tierNumber,
          tierTitle,
          provider,
        },
      });
    } else {
      navigate("/save", {
        state: {
          walletType: "savings",
          tierNumber,
          tierTitle,
          provider,
        },
      });
    }
  };

  const getButtonText = (isLocked: boolean, isHighYield: boolean) => {
    if (isLocked && isHighYield) return "Locked";
    if (action === "deposit") return "Deposit";
    if (action === "withdraw") return "Withdraw";
    return isHighYield ? "Subscribe" : "Subscribe";
  };

  return (
    <div className="h-screen bg-[#181818] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white/90 flex items-center gap-1.5">
          Earn{" "}
          <span>
            <Sprout size={20} />
          </span>
        </h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#9ca3af" size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4 mb-6">
          {stableYieldTiers.map((tier) => (
            <div
              key={`stable-${tier.id}`}
              className={`${tier.bgColor} rounded-2xl py-3 px-5 relative overflow-hidden transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 relative z-10">
                  <h3 className="text-white/90 text-base font-semibold mb-2">
                    {tier.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80">
                    {tier.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStableExplore(tier.id, tier.title)}
                className={`mt-4 px-5 py-2 ${tier.buttonBg} ${tier.buttonText} rounded-full text-xs font-semibold transition-colors relative z-10 flex items-center gap-2`}
              >
                <span>{getButtonText(false, false)}</span>
              </button>

              {/* Bottom Right Image with flowing white highlight */}
              {/* <div className="pointer-events-none absolute bottom-[-20px] right-[-24px] w-32 h-22 rounded-[999px] bg-white/90 rotate-[-18deg]" /> */}
              <img
                src={tier.image}
                alt={tier.title}
                className={`absolute bottom-[4px] right-[4px] ${tier.imageClass}`}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {highYieldTiers.map((tier) => (
            <div
              key={`high-yield-${tier.id}`}
              className={`${tier.bgColor} rounded-2xl py-3 px-5 relative overflow-hidden transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 relative z-10">
                  <h3 className="text-white text-base font-semibold mb-2">
                    {tier.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      tier.isLocked ? "text-white/80" : "text-white/80"
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleHighYieldExplore(tier.id, tier.title)}
                disabled={tier.isLocked}
                className={`mt-4 px-6 py-2.5 ${tier.buttonBg} ${tier.buttonText} rounded-full text-xs font-semibold transition-colors relative z-10 flex items-center gap-2 ${
                  tier.isLocked ? "cursor-not-allowed" : ""
                }`}
              >
                {tier.isLocked && <LockKeyhole size={14} />}
                <span>{getButtonText(tier.isLocked || false, true)}</span>
              </button>

              {/* Bottom Right Image */}
              <img
                src={tier.image}
                alt={tier.title}
                className={tier.imageClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title={
          action === "deposit"
            ? "Deposit to Tiers"
            : action === "withdraw"
              ? "Withdraw from Tiers"
              : "Yield Tiers"
        }
        content={
          action === "deposit"
            ? [
                "Select a tier to deposit your funds. Each tier offers different APY rates and features.",
                "High Yield Tiers: Flexible tier offers 25% APY for LPT tokens. Platinum and Diamond tiers are currently locked.",
                "Stable Yield Tiers: USD Base offers up to 6.5% APY on Ethereum. USD Plus offers up to 14% APY on Solana.",
              ]
            : action === "withdraw"
              ? [
                  "Select the tier you want to withdraw from.",
                  "You can only withdraw from the same tier you deposited to.",
                  "High Yield withdrawals require a 7-day unbonding period.",
                  "Stable Yield withdrawals are instant.",
                ]
              : [
                  "Yield Tiers offer different APY rates for your investments.",
                  "High Yield Tiers: Flexible (25% APY), Platinum (40% APY - locked), Diamond (60% APY - locked).",
                  "Stable Yield Tiers: USD Base (6.5% APY on Ethereum), USD Plus (14% APY on Solana).",
                  "Select a tier to start earning rewards on your investments.",
                ]
        }
      />
    </div>
  );
};
