import React, { useState } from "react";
import { CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

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
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const earnCards: EarnCard[] = [
    {
      id: "1",
      title: "Invite Friends",
      description: "Earn inviting your friends to Lisar",
      image: "/earn1.jpeg",
      buttonText: "Get started",
      isComingSoon: true,
    },
    {
      id: "2",
      title: "Creator Program",
      description: "Get paid creating content for Lisar",
      image: "/earn2.jpeg",
      buttonText: "Get started",
      isComingSoon: true,
    },
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
    if (card.isComingSoon) {
      // Open Telegram link
      window.open("https://t.me/+F0YXOMaiJMxkODVk", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header - Scrollable */}
        <div className="flex items-start justify-between py-8">
          <div>
            <h1 className="text-lg font-medium text-white">Earn on Lisar</h1>
            <p className="text-xs text-gray-500">
              Get paid creating content or inviting friends
            </p>
          </div>
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
              className={`bg-[#1a1a1a] rounded-xl overflow-hidden ${
                card.isSocialCard ? "cursor-pointer hover:bg-[#2a2a2a] transition-colors" : ""
              }`}
              onClick={() => card.isSocialCard && handleCardClick(card)}
            >
              {/* Card Image */}
              {!card.isSocialCard && (
                <div className="w-full h-48 relative">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Card Content */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-large mb-3">
                  {card.title}
                </h3>

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
                      href="https://youtube.com/@lisarstake"
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
                </p>

                {/* Action Button */}
                {!card.isSocialCard && (
                  <button
                    onClick={() => handleCardClick(card)}
                    className={`mt-3 py-1.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                      card.isComingSoon
                        ? "bg-blue-500 text-white cursor-not-allowed opacity-75"
                        : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
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

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/earn" />
    </div>
  );
};
