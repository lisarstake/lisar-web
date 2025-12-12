import React from "react";
import { ChevronLeft, Key, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const TiersPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleExplore = (tierNumber: number, tierTitle: string) => {
    // Handle explore action for unlocked tiers
    if (tierNumber === 1) {
      // Navigate to validator page with tier name
      navigate("/validator", { state: { tierName: tierTitle } });
    }
  };

  // Tier cards data
  const tiers = [
    {
      id: 1,
      title: "Flexible",
      description: "Start your journey with our entry-level tier. Perfect for beginners.",
      isLocked: false,
      bgColor: "bg-transparent border-2 border-[#2a2a2a]",
      buttonBg: "bg-[#a3d039] hover:bg-[#B8E55A]",
      buttonText: "text-black",
      image: "/highyield-1.svg",
      imageClass: "absolute bottom-[-5px] right-[-5px] w-16 h-16 object-contain opacity-80",
    },
    {
      id: 2,
      title: "Platinum",
      description: "Unlock higher yields. This tier offers enhanced returns for committed members.",
      isLocked: true,
      bgColor: "bg-transparent border-2 border-[#2a2a2a]",
      buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
      buttonText: "text-white/50",
      image: "/highyield-2.svg",
      imageClass: "absolute bottom-[-15px] right-[0px] w-24 h-24 object-contain opacity-80",
    },
    {
      id: 3,
      title: "Diamond",
      description: "Premium tier with maximum benefits and highest APY. Reserved for our most valued members.",
      isLocked: true,
      bgColor: "bg-transparent border-2 border-[#2a2a2a]",
      buttonBg: "bg-[#2a2a2a] cursor-not-allowed opacity-50",
      buttonText: "text-white/50",
      image: "/highyield-4.svg",
      imageClass: "absolute bottom-[-15px] right-[-15px] w-24 h-24 object-contain opacity-80",
    },
  ];

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

        <h1 className="text-lg font-medium text-white">Tier Plans</h1>

        <div className="w-8 h-8" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="space-y-4">
          {tiers.map((tier) => (
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
                <span>{tier.isLocked ? "Locked" : "Explore"}</span>
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
    </div>
  );
};

