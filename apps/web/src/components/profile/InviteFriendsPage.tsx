import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useCampaign } from "@/contexts/CampaignContext";

export const InviteFriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    referralCode,
    copySuccess,
    handleCopyReferralCode,
    handleGenerateReferralCode,
    isGenerating,
  } = useCampaign();

  const handleCopyCode = async () => {
    if (!referralCode) return;
    await handleCopyReferralCode();
  };

  const handleShare = async () => {
    if (!referralCode) {
      await handleGenerateReferralCode();
      return;
    }

    const shareMessage = `Join Lisar with my referral code: ${referralCode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Lisar",
          text: shareMessage,
        });
        return;
      }
      await navigator.clipboard.writeText(shareMessage);
    } catch {
      // keep UX silent
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#2a2a2a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-large font-medium text-white">Invite friends</h1>

        <div className="h-12 w-12" />
      </div>

      <div className="flex-1 px-6 pb-48 flex flex-col items-center justify-center text-center">
        <img
          src="/fund.png"
          alt="Invite reward"
          className="h-[150px] w-[150px] object-contain"
        />

        <h2 className="mt-6 text-large font-semibold text-white">
          Invite Friends, Earn Coins
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#c4cdc9] max-w-xs">
          Spread the love ❤️ about Lisar and earn coins as rewards! Join the early savers campiagn to begin
        </p>

        <div className="mt-8 rounded-lg border border-white/10 p-3 w-full max-w-sm">
          <p className="text-base text-[#c4cdc9]">Referral code</p>

          <div className="mt-1 flex items-center justify-center">
            <p className="text-base font-medium text-white">
              {referralCode || "No code yet"}
            </p>

            <button
              onClick={handleCopyCode}
              disabled={!referralCode}
              className="h-8 w-8 text-[#C7EF6B] flex items-center justify-center disabled:opacity-40"
              aria-label="Copy referral code"
            >
              {copySuccess ? "✓" : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-30 px-6 z-20 bg-transparent">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="py-3 w-full rounded-full bg-[#C7EF6B] text-base font-medium text-black disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Share referral link"}
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
