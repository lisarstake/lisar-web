import React, { useState } from "react";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { stableYieldTiers } from "@/mock";
import { useStablesApy } from "@/hooks/useStablesApy";
import { useWallet } from "@/contexts/WalletContext";

export const StableTiersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const locationState = location.state as {
    walletType?: string;
    action?: "deposit" | "withdraw" | "vest";
  } | null;

  const action = locationState?.action || "vest";
  const {
    maple: mapleApy,
    perena: perenaApy,
    isLoading: apyLoading,
  } = useStablesApy();
  const { solanaUsdcBalance, ethereumUsdcBalance, stablesLoading } =
    useWallet();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleExplore = (tierNumber: number, tierTitle: string) => {
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
      // For vest action, check if user has required balance
      const balance =
        tierNumber === 1
          ? (ethereumUsdcBalance ?? 0)
          : (solanaUsdcBalance ?? 0);

      if (balance > 0) {
        navigate("/save", {
          state: {
            walletType: "savings",
            tierNumber,
            tierTitle,
            provider,
          },
        });
      } else {
        // Navigate to deposit if no balance
        navigate("/deposit", {
          state: {
            walletType: "savings",
            tierNumber,
            tierTitle,
            provider,
            returnTo: "/stable-tiers",
          },
        });
      }
    }
  };

  const getButtonText = (tierNumber: number) => {
    if (action === "deposit") return "Deposit";
    if (action === "withdraw") return "Withdraw";

    // For vest action, check balance
    const balance =
      tierNumber === 1 ? (ethereumUsdcBalance ?? 0) : (solanaUsdcBalance ?? 0);

    return balance > 0 ? "Vest" : "Top up";
  };

  const hasRequiredBalance = (tierNumber: number) => {
    if (action !== "vest") return true; // Always enabled for deposit/withdraw

    const balance =
      tierNumber === 1 ? (ethereumUsdcBalance ?? 0) : (solanaUsdcBalance ?? 0);

    return balance > 0;
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#86B3F7" />
        </button>

        <h1 className="text-lg font-medium text-white">
          {action === "deposit"
            ? "Deposit to"
            : action === "withdraw"
              ? "Withdraw from"
              : "Yield Tiers"}
        </h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4">
          {stableYieldTiers.map((tier) => (
            <div
              key={tier.id}
              className={`${tier.bgColor} rounded-2xl p-5 relative overflow-hidden transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 relative z-10">
                  <h3 className="text-white/90 text-base font-semibold mb-2">
                    {tier.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/60">
                    {tier.id === 1
                      ? `Earn stable yields with flexible access to your savings. Up to ${
                          apyLoading && mapleApy === null
                            ? ".."
                            : mapleApy
                              ? `${(mapleApy * 100).toFixed(1)}%`
                              : "6.5%"
                        } per annum.`
                      : `Higher stable yields with flexible access to your savings. Up to ${
                          apyLoading && perenaApy === null
                            ? ".."
                            : perenaApy
                              ? `${(perenaApy * 100).toFixed(1)}%`
                              : "14%"
                        } per annum.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleExplore(tier.id, tier.title)}
                disabled={stablesLoading}
                className={`mt-4 px-5 py-2 ${tier.buttonBg} ${tier.buttonText} rounded-full text-sm font-semibold transition-colors relative z-10 flex items-center gap-2 ${
                  stablesLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>
                  {stablesLoading ? "A moment.." : getButtonText(tier.id)}
                </span>
              </button>

              {/* Bottom Right Image with flowing white highlight */}
              <div className="pointer-events-none absolute bottom-[-20px] right-[-24px] w-32 h-22 rounded-[999px] bg-white/90 rotate-[-18deg]" />
              <img
                src={tier.image}
                alt={tier.title}
                className={`absolute bottom-[4px] right-[4px] ${tier.imageClass}`}
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
            ? "Deposit to "
            : action === "withdraw"
              ? "Withdraw from "
              : "Stable Yield Tiers"
        }
        content={
          action === "deposit"
            ? [
                "Select a tier to deposit your USDC funds. Each tier offers different APY rates and features.",
                `USD Base offers up to ${
                  apyLoading && mapleApy === null
                    ? ".."
                    : mapleApy
                      ? `${(mapleApy * 100).toFixed(1)}%`
                      : "6.5%"
                } APY on Ethereum network with flexible withdrawals.`,
                `USD Plus offers up to ${
                  apyLoading && perenaApy === null
                    ? ".."
                    : perenaApy
                      ? `${(perenaApy * 100).toFixed(1)}%`
                      : "14%"
                } APY on Solana network with instant access to your funds.`,
              ]
            : action === "withdraw"
              ? [
                  "Select the tier you want to withdraw from.",
                  "You can only withdraw from the same tier you deposited to.",
                ]
              : [
                  "Stable Yield Tiers offer different APY rates for your USDC investments.",
                  `USD Base - Up to ${
                    apyLoading && mapleApy === null
                      ? ".."
                      : mapleApy
                        ? `${(mapleApy * 100).toFixed(1)}%`
                        : "6.5%"
                  } APY: Invest on Ethereum network with flexible withdrawal options.`,
                  `USD Plus - Up to ${
                    apyLoading && perenaApy === null
                      ? ".."
                      : perenaApy
                        ? `${(perenaApy * 100).toFixed(1)}%`
                        : "14%"
                  } APY: Invest on Solana network with instant access to funds.`,
                ]
        }
      />
    </div>
  );
};
