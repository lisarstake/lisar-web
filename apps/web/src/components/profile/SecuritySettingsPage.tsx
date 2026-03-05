import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  ArrowLeft,
  CircleArrowOutUpRight,
  KeyRound,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { BottomNavigation } from "../general/BottomNavigation";

const rowClass =
  "flex w-full items-center rounded-xl bg-[#13170a] px-4 py-4 text-left";

export const SecuritySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state.isLoading) return;

    if (state.user) {
      setIsLoading(false);
      return;
    }

    navigate("/login");
  }, [state.user, state.isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading security settings..." />;
  }

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

        <h1 className="text-lg font-medium text-white">Security</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 scrollbar-hide">
        <button className={rowClass}>
          <BadgeCheck size={20} className="text-[#be860e]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">2-step authentication</p>
            <p className="text-base text-[#8f9b95]">
              Extra protection to boost account security
            </p>
          </div>
        </button>

        <button className={rowClass}>
          <KeyRound size={20} className="text-[#ff7a38]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">Change password</p>
            <p className="text-base text-[#8f9b95]">Update your account password</p>
          </div>
        </button>

        <button className={rowClass}>
          <Lock size={20} className="text-[#6b78d9]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">App lock</p>
            <p className="text-base text-[#8f9b95]">Manage how you unlock your app</p>
          </div>
        </button>

        <button className={rowClass}>
          <CircleArrowOutUpRight
            size={20}
            className="text-[#ff4c3d]"
            strokeWidth={2.1}
          />
          <div className="ml-4">
            <p className="text-base font-semibold">Instant withdrawal</p>
            <p className="text-base text-[#8f9b95]">Withdraw without 2FA verification</p>
          </div>
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
