import React, { useState } from "react";
import { ChevronLeft, Key, LockKeyhole, CircleQuestionMark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { highYieldTiers } from "@/mock";

export const TiersPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleExplore = (tierNumber: number, tierTitle: string) => {
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

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">Yield Tiers</h1>

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
          {highYieldTiers.map((tier) => (
            <div
              key={tier.id}
              className={`${tier.bgColor} rounded-2xl p-5 relative overflow-hidden transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 relative z-10">
                  <h3 className="text-white text-base font-semibold mb-2">
                    {tier.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      tier.isLocked ? "text-white/60" : "text-white/90"
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleExplore(tier.id, tier.title)}
                disabled={tier.isLocked}
                className={`mt-4 px-6 py-2.5 ${tier.buttonBg} ${tier.buttonText} rounded-full text-xs font-semibold transition-colors relative z-10 flex items-center gap-2 ${
                  tier.isLocked ? "cursor-not-allowed" : ""
                }`}
              >
                {tier.isLocked && <LockKeyhole size={14} />}
                <span>{tier.isLocked ? "Locked" : "Vest"}</span>
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
        title="High Yield Tiers"
        content={[
          "High Yield Tiers offer different APY rates for your LPT token investments.",
          "Flexible Tier - 25% APY: Start your journey with our entry-level tier. Perfect for beginners looking to earn rewards.",
          "Platinum Tier - 40% APY: Unlock higher yields with enhanced returns for committed members. (Currently locked)",
          "Diamond Tier - 60% APY: Premium tier with maximum benefits and highest APY. Reserved for our most valued members. (Currently locked)",
          "Select the Flexible tier to start staking your LPT tokens and earning rewards.",
        ]}
      />
    </div>
  );
};
