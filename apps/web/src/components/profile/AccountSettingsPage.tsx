import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Star,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { BottomNavigation } from "../general/BottomNavigation";
import { ExportWalletDrawer } from "@/components/general/ExportWalletDrawer";

const rowClass =
  "flex w-full items-center rounded-xl bg-[#13170a] px-4 py-4 text-left";

export const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showExportDrawer, setShowExportDrawer] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (state.isLoading) return;

        if (state.user) {
          setIsLoading(false);
        } else if (state.isAuthenticated) {
          await refreshUser();
          setIsLoading(false);
        } else {
          navigate("/login");
        }
      } catch {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [state.user, state.isAuthenticated, state.isLoading, refreshUser, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading account..." />;
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

        <h1 className="text-lg font-medium text-white">Account information</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 scrollbar-hide">
        <button
          className={rowClass}
          onClick={() => navigate("/settings/account/personal-details")}
        >
          <UserRound size={20} className="text-[#1fc2ea]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-medium">Personal details</p>
            <p className="text-sm text-[#c4cdc9]">
              Review and update your personal info
            </p>
          </div>
        </button>

        <button
          className={rowClass}
          onClick={() => navigate("/settings/invite-friends")}
        >
          <Star size={20} className="text-[#e7a609]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-medium">Invite friends</p>
            <p className="text-sm text-[#c4cdc9]">
              Earn rewards by bringing in your friends
            </p>
          </div>
        </button>

        <button className={rowClass} onClick={() => setShowExportDrawer(true)}>
          <FileText size={20} className="text-[#85a456]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-medium">Export wallet</p>
            <p className="text-sm text-[#c4cdc9]">
              Export your wallet private keys
            </p>
          </div>
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <ExportWalletDrawer
        isOpen={showExportDrawer}
        onClose={() => setShowExportDrawer(false)}
      />
    </div>
  );
};
