import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppWindowMac,
  Banknote,
  Bell,
  ArrowLeft,
  PaintBucket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { BottomNavigation } from "../general/BottomNavigation";

const rowClass =
  "flex w-full items-center rounded-xl bg-[#13170a] px-4 py-4 text-left";

export const PreferencesSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

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
    return <LoadingSpinner message="Loading preferences..." />;
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

        <h1 className="text-lg font-medium text-white">Preferences</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 scrollbar-hide">
        <button className={rowClass}>
          <Bell size={20} className="text-[#be860e]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">Notifications</p>
            <p className="text-base text-[#c4cdc9]">
              Customize your notification experience
            </p>
          </div>
        </button>

        <button className={rowClass}>
          <PaintBucket size={20} className="text-[#27bde6]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">App Theme</p>
            <p className="text-base text-[#c4cdc9]">
              Control Lisar app&apos;s look and feel
            </p>
          </div>
        </button>

        <button className={rowClass}>
          <Banknote size={20} className="text-[#e5e8e7]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">Display Currency</p>
            <p className="text-base text-[#c4cdc9]">Nigerian Naira</p>
          </div>
        </button>

        <button className={rowClass}>
          <AppWindowMac size={20} className="text-[#1cd237]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-semibold">App Icon</p>
            <p className="text-base text-[#c4cdc9]">
              Change Lisar app icon to your style
            </p>
          </div>
        </button>
      </div>

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
