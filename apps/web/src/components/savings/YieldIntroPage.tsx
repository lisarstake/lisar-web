import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { YIELD_ASSET_PICKER_PATH } from "@/lib/yieldPaths";

type YieldContent = {
  title: string;
  rate: string;
  rateSuffix: string;
  description: string;
  benefits: string[];
  cta: string;
  bgColor: string;
  textColor: string;
  image: string;
};

const YIELD_CONTENT: Record<string, YieldContent> = {
  savings: {
    title: "Lisar Savings",
    rate: "15",
    rateSuffix: "% APY",
    description:
      "Save your money and earn daily interest. Your funds stay safe and you can withdraw anytime.",
    benefits: [
      "Earn daily interest",
      "Withdraw anytime",
      "Your money stays safe",
    ],
    cta: "Start saving",
    bgColor: "bg-[#438af6]",
    textColor: "text-white",
    image: "/hero.svg",
  },
  growth: {
    title: "Lisar Growth",
    rate: "40",
    rateSuffix: "% APY",
    description:
      "Grow your money by investing in digital assets. Higher returns, but keep your money for longer.",
    benefits: [
      "Higher returns up to 40%",
      "Best for long-term goals",
      "Daily earnings",
    ],
    cta: "Start growing",
    bgColor: "bg-[#C7EF6B]",
    textColor: "text-black",
    image: "/hero.svg",
  },
  flex: {
    title: "Lisar Flex",
    rate: "15",
    rateSuffix: "% APY",
    description:
      "Set a daily spend limit for yourself. The rest of your money earns interest while you spend.",
    benefits: [
      "Daily spend money sent to you",
      "Rest of your money earns interest",
      "Flexible spending with growth",
    ],
    cta: "Start flexing",
    bgColor: "bg-[#a78bfa]",
    textColor: "text-black",
    image: "/hero.svg",
  },
};

export const YieldIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stablesBalance } = useWallet();
  const { delegatorStakeProfile } = useDelegation();
  const hasSavings = Boolean(stablesBalance && stablesBalance > 0);
  const hasStaking = Boolean(
    delegatorStakeProfile &&
    parseFloat(delegatorStakeProfile.currentStake || "0") > 0,
  );

  const walletTypeFromState = (location.state as { walletType?: string } | null)?.walletType;

  const content = useMemo(() => {
    if (walletTypeFromState === "growth") return YIELD_CONTENT.growth;
    if (walletTypeFromState === "flex") return YIELD_CONTENT.flex;
    return YIELD_CONTENT.savings;
  }, [walletTypeFromState]);

  useEffect(() => {
    if (hasSavings && !walletTypeFromState) {
      navigate("/wallet/savings", { replace: true });
      return;
    }

    if (hasStaking && !walletTypeFromState) {
      navigate("/wallet/staking", { replace: true });
    }
  }, [hasSavings, hasStaking, navigate, walletTypeFromState]);

  const handleExploreClick = () => {
    if (walletTypeFromState === "savings") {
      navigate("/wallet/savings", { replace: true });
    } else if (walletTypeFromState === "growth") {
      navigate("/wallet/staking", { replace: true });
    } else if (walletTypeFromState === "flex") {
      navigate("/wallet/flex", { replace: true });
    } else if (hasSavings) {
      navigate("/wallet/savings", { replace: true });
    } else if (hasStaking) {
      navigate("/wallet/staking", { replace: true });
    } else {
      navigate(YIELD_ASSET_PICKER_PATH, { replace: true });
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate("/wallet", { replace: true })}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide flex flex-col justify-center">

        <img
          src={content.image}
          alt={content.title}
          className="rounded-xl h-[380px] mx-auto"
        />

        <h2 className="mt-4 text-lg font-medium text-white/90">
          {content.title}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-white/80">
          {content.description}
        </p>

        <div className="mt-6 space-y-4">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-white/80 text-xs">★</span>
              <p className="text-sm text-white/80">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8 pt-3 bg-[#050505] shrink-0">
        <button
          onClick={handleExploreClick}
          className={`h-14 w-full rounded-full text-base font-semibold ${content.bgColor} ${content.textColor}`}
        >
          {content.cta}
        </button>
      </div>
    </div>
  );
};