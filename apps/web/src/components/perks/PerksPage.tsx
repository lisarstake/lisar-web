import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CircleQuestionMark,
  Coffee,
  Gift,
  ChevronDown,
  LampDesk,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { HelpDrawer } from "@/components/general/HelpDrawer";

export const PerksPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [benefitsExpanded, setBenefitsExpanded] = useState(false);

  // TODO: Replace with actual user points from API
  const userPoints = 0;

  const handleBackClick = () => {
    navigate("/earn");
  };

  const handleRedeemPoints = () => {
    // TODO: Implement redeem points functionality
    console.log("Redeem points clicked");
  };

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-base font-medium text-white">Perks</h1>
        <button
          onClick={() => setShowHelpDrawer(true)}
          className="w-8 h-8 bg-[#505050] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#fff" size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-20 scrollbar-hide">
        {/* Cafe One Image */}
        <div className="w-full h-48 relative rounded-lg overflow-hidden mb-6">
          <img
            src="/cafeone.jpeg"
            alt="Cafe One"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Points Card */}
        <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
          <CardContent className="px-4 py-4">
            <CardTitle className="text-white text-lg mb-2">Cafe One</CardTitle>
            <p className="text-xs text-gray-400 mb-4">
              Save on Lisar and accumulate points redeemable on purchases at CafeOne.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-[#505050] rounded-md">
           
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs font-semibold text-white/90">{userPoints} points</p>
                </div>
              </div>
              <Button
                onClick={handleRedeemPoints}
                className="bg-[#505050] hover:bg-[#333333] text-white text-xs px-3 py-1 rounded-full transition-colors"
              >
                Redeem Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card - Collapsible */}
        <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
          <CardContent className="px-4 py-3">
            {/* Collapsible Header */}
            <button
              onClick={() => setBenefitsExpanded(!benefitsExpanded)}
              className="flex items-center justify-between w-full mb-0"
            >
              <CardTitle className="text-white text-sm">
                Discount Benefits
              </CardTitle>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${benefitsExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {/* Collapsible Content */}
            {benefitsExpanded && (
              <div className="space-y-3 mt-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#505050]">
                  <Gift className="w-4 h-4 text-white/70" />
                  <p className="text-xs text-white/70">Discount on purchases (Coffee and pastries)</p>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#505050]">
                  <LampDesk className="w-4 h-4 text-white/70" />
                  <p className="text-xs text-white/70">Discount on co-working spaces</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
          <CardContent className="px-4 py-4">
            <CardTitle className="text-white text-sm mb-3">How It Works</CardTitle>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">1. Save money on Lisar → Earn points</p>
              <p className="text-xs text-gray-400">2. Points automatically tracked</p>
              <p className="text-xs text-gray-400">3. Redeem at all Cafe One locations</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg mb-6">
          <h3 className="text-white font-semibold mb-1 text-sm">
            Ready to start?
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Save on Lisar and start accumulating points for CafeOne discounts.
          </p>
          <button
            onClick={() => navigate("/wallet")}
            className="w-full py-2.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium rounded-full transition-colors text-sm"
          >
            Start Saving
          </button>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Perks Guide"
        content={[
          "Save money on Lisar to earn points automatically.",
          "Points can be redeemed for discounts at Cafe One.",
          "Discounts apply to purchases, coffee, pastries, and workspace.",
        ]}
      />
    </div>
  );
};
