import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const InviteFriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const referralCode = "lisar50";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
    } catch {
      // Keep UX silent if clipboard is blocked
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-large font-semibold text-white">Invite friends</h1>

        <div className="h-12 w-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-48 scrollbar-hide">
        <img
          src="/h4.png"
          alt="Invite reward"
          className="mx-auto mt-3 h-[320px] w-[320px] object-contain"
        />

        <h2 className="mt-4 text-center text-large font-semibold text-white">
          Invite Friends, Earn Coins
        </h2>
        <p className="mt-3 text-center text-base leading-relaxed text-[#c4cdc9]">
          You and your friend will receive rewards after their first transaction,
          and you earn commission from eligible activity.
        </p>

        <div className="mt-8 rounded-[22px] border border-white/10 bg-[#15161f] px-6 py-8">
          <p className="text-center text-base text-[#c4cdc9]">Referral code</p>

          <div className="mt-4 flex items-center justify-center gap-4">
            <p className="text-large font-medium text-white">{referralCode}</p>
            <button
              onClick={handleCopyCode}
              className="h-11 w-11 rounded-lg border border-[#a9eb5b] text-[#a9eb5b] flex items-center justify-center"
              aria-label="Copy referral code"
            >
              <Copy size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-20 px-6 z-20 bg-transparent">
        <button className="h-14 w-full rounded-full bg-[#a9eb5b] text-base font-semibold text-black">
          Share referral link
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
