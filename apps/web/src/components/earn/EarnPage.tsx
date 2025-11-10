import React, { useState } from "react";
import { CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface EarnCard {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  isComingSoon: boolean;
}

export const EarnPage: React.FC = () => {
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const earnCards: EarnCard[] = [
    {
      id: "1",
      title: "Invite Friends",
      description: "Earn inviting your friend to Lisar",
      image: "/earn1.jpeg",
      buttonText: "Coming soon",
      isComingSoon: true,
    },
    {
      id: "2",
      title: "Creator Program",
      description: "Get paid creating content for Lisar",
      image: "/earn2.jpeg",
      buttonText: "Coming soon",
      isComingSoon: true,
    },
  ];

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleCardClick = (card: EarnCard) => {
    if (!card.isComingSoon) {
      // Handle card action when it's not coming soon
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header - Scrollable */}
        <div className="flex items-center justify-between py-8">
          <h1 className="text-lg font-medium text-white">Earn on Lisar</h1>

          <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
        </div>

        {/* Earn Cards */}
        <div className="space-y-6">
          {earnCards.map((card) => (
            <div
              key={card.id}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden"
            >
              {/* Card Image */}
              <div className="w-full h-48 relative">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-large mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm mb-2 leading-relaxed">
                  {card.description}
                </p>

                {/* Action Button */}
                <button
                  onClick={() => handleCardClick(card)}
                  disabled={card.isComingSoon}
                  className={` py-1.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                    card.isComingSoon
                      ? "bg-blue-500 text-white cursor-not-allowed opacity-75"
                      : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                  }`}
                >
                  {card.buttonText}
                </button>
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
          "Currently coming soon, stay tuned for updates."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/earn" />
    </div>
  );
};
