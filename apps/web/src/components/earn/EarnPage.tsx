import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleQuestionMark, Info, Tag } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { PerksDrawer } from "@/components/general/PerksDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useCampaign } from "@/contexts/CampaignContext";

interface EarnCard {
  id: string;
  title: string;
  description: string;
  image?: string;
  buttonText: string;
  isComingSoon: boolean;
  isSocialCard?: boolean;
}

export const EarnPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showPerksPromoDrawer, setShowPerksPromoDrawer] = useState(false);
  const { campaignStatus } = useCampaign();

  const status = campaignStatus as { current_tier?: number; enrollment?: object } | null;
  const isCampaignOngoing =
    !!status &&
    (typeof status.current_tier === "number" ||
      (status.enrollment && Object.keys(status.enrollment).length > 0));
  const campaignStatusLabel = isCampaignOngoing ? "ongoing" : "not started";
  const campaignButtonText = isCampaignOngoing ? "Check progress" : "Join Campaign";

  const earnCards: EarnCard[] = [
    {
      id: "1",
      title: `Lisar points`,
      description: "Save on Lisar, accumulate points redeemable as perks and discounts at different partners.",
      image: "/cafeone.jpeg",
      buttonText: 'Convert points',
      isComingSoon: false,
    },
    // {
    //   id: "flex-card",
    //   title: "Lisar Flex Card",
    //   description: "Pay for your favorite subscriptions with your savings yield. Over 1700+ providers supported.",
    //   buttonText: "Get your card",
    //   isComingSoon: false,
    // },
    {
      id: "3",
      title: "Connect with us",
      description: "Follow us on social media for new updates",
      buttonText: "Follow",
      isComingSoon: false,
      isSocialCard: true,
    },
  ];

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleCardClick = (card: EarnCard) => {
    if (card.id === "1") {
      navigate("/perks");
    } else if (card.id === "flex-card") {
      navigate("/earn/flex-card");
    } else if (card.isComingSoon) {
      window.open(
        "https://t.me/+F0YXOMaiJMxkODVk",
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-6 bg-[#050505]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-medium text-white">Explore</h1>
            <p className="text-xs text-gray-500">
              Discover features on Lisar
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-20 scrollbar-hide">
        {/* Earn Cards */}
        <div className="space-y-6">
          {earnCards.map((card) => (
            <div
              key={card.id}
              className={`bg-[#151515] rounded-xl overflow-hidden ${card.isSocialCard
                ? "cursor-pointer hover:bg-[#505050] transition-colors"
                : "cursor-pointer"
                }`}
              onClick={() => handleCardClick(card)}
            >
              {/* Card Image */}
              {!card.isSocialCard && (
                card.id === "flex-card" ? (
                  <div className="w-full h-40 relative rounded-2xl overflow-hidden bg-[linear-gradient(145deg,#1a1a1a_0%,#2d2d2d_40%,#1a1a1a_100%)] border border-[#333]">
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)" }} />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl" />
                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs tracking-widest text-white/40 font-medium uppercase">Lisar Flex</p>
                        </div>
                        <svg className="text-white/30" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                          <path d="M12 19a9 9 0 0 1 0-14" />
                          <path d="M15.5 21.5a13 13 0 0 1 0-19" />
                        </svg>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase mb-2 text-white/70">Supports</p>
                          <div className="flex gap-2 items-center">
                            <img src="/claude.svg" alt="Claude" className="w-5 h-5" />
                            <img src="/lovable.png" alt="Lovable" className="w-5 h-5" />
                            <img src="/spotify2.png" alt="Spotify" className="w-5 h-5" />
                            <img src="/capcut.jpg" alt="CapCut" className="w-5 h-5 rounded-full" />
                            <img src="/netflix.png" alt="Netflix" className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-[#EB001B]" />
                          <div className="w-7 h-7 rounded-full bg-[#F79E1B] -ml-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                null
                )
              )}

              {/* Card Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-[17px]">
                    {card.id === "1" && <Tag size={16} className="inline-block mr-1.5 text-[#C7EF6B]" />}
                    {card.title}
                  </h3>
                  
                </div>

                {/* Social Icons - Between Title and Description */}
                {card.isSocialCard && (
                  <div className="flex items-center justify-start gap-5 mb-3">
                    {/* X/Twitter Logo */}
                    <a
                      href="https://x.com/lisarstake"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                          fill="white"
                        />
                      </svg>
                    </a>

                    {/* Telegram Logo */}
                    <a
                      href="https://t.me/+F0YXOMaiJMxkODVk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/telegram.png"
                        alt="Telegram"
                        className="w-7 h-7"
                      />
                    </a>

                    {/* YouTube Logo */}
                    <a
                      href="https://youtube.com/@lisarstakee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src="/youtube.png"
                        alt="Telegram"
                        className="w-8 h-8"
                      />
                    </a>
                  </div>
                )}

                <p className="text-gray-400 text-sm leading-relaxed">
                  {card.description}
                  {/* {card.id === "1" && (
                    <>
                      {" "}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowPerksPromoDrawer(true); }}
                        className="text-[#86B3F7] underline underline-offset-2 inline hover:text-[#96C3F7]"
                      >
                        Learn more
                      </button>
                    </>
                  )} */}
                </p>

                {/* Action Button */}
                 {!card.isSocialCard && (
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleCardClick(card);
                     }}
                     className={`mt-3 py-1.5 px-4 rounded-full font-medium text-sm transition-colors ${card.isComingSoon
                       ? "bg-blue-500 text-white cursor-not-allowed opacity-75"
                       : "rounded-full border-2 border-black bg-[#C7EF6B] text-black"
                       }`}
                   >
                     {card.buttonText}
                   </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Earning Guide"
        content={[
          "Earn money referring friends to Lisar or creating content for Lisar.",
          "Currently coming soon, stay tuned for updates.",
        ]}
      />

      {/* Perks Promo Drawer */}
      <PerksDrawer
        isOpen={showPerksPromoDrawer}
        onClose={() => setShowPerksPromoDrawer(false)}
        buttonText="Close"
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/earn" />
    </div>
  );
};
