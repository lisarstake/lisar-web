import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  EyeOff,
  ChevronRight,
  MoreVertical,
  CreditCard,
  CircleQuestionMark,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";

export const CardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  // Get user's first name in uppercase
  const getUserFirstName = () => {
    if (state.user?.full_name) {
      const firstName = state.user.full_name.split(" ")[0];
      return firstName.toUpperCase();
    }
    return "USER";
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#181818] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header */}
        <div className="flex items-start justify-between py-8">
          <div>
            <h1 className="text-lg font-medium text-white">Cards <span className="text-gray-400 text-sm">(Coming Soon)</span></h1>
            <p className="text-xs text-gray-500">
              Manage your virtual cards and more
            </p>
          </div>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#9ca3af" size={16} />
          </button>
        </div>

        {/* Virtual Card */}
        <div className="mb-6 opacity-70">
          <div className="relative rounded-2xl p-6 h-[200px] bg-linear-to-br from-gray-850 via-gray-850 to-black overflow-hidden border border-gray-800/50">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-500/10 rounded-full blur-2xl"></div>

            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top Section */}
              <div className="flex items-start justify-between">
                <span className="text-white/80 text-sm font-medium">
                  Virtual Card
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-lg font-bold">LISAR</span>
                </div>
              </div>

              {/* Middle Section - Card Number */}
              <div className="flex items-center gap-2">
                {showCardDetails ? (
                  <span className="text-white text-xl font-mono tracking-wider">
                    4532 1234 5678 7198
                  </span>
                ) : (
                  <span className="text-white text-xl font-mono tracking-wider">
                    **** **** **** 7198
                  </span>
                )}
              </div>

              {/* Bottom Section */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">Cardholder Name</p>
                  <p className="text-white text-sm font-semibold uppercase">
                    {getUserFirstName()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-xs uppercase">debit</span>
                  {/* Mastercard Logo */}
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full -mr-3 relative z-10"></div>
                    <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Description */}
        <div className="mb-3">
            <p className="text-white/80 font-medium">Coming Soon</p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Pay for expenses like Netflix, Spotify, and more. Accepted at 150M+ merchants
            globally and in over 60 countries.{" "}
          </p>
        </div>

        {/* Card Management Options */}
      
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/cards" />
    </div>
  );
};
