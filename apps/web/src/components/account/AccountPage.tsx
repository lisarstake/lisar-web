import React, { useState } from "react";
import {
  CircleQuestionMark,
  Users,
  User,
  Shield,
  CreditCard,
  Bell,
  Key,
  LogOut,
  MessageCircle,
  UserPlus,
  Headset,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      // Still navigate to home even if logout fails
      navigate("/");
    }
  };

  return (
    <div className="h-screen bg-[#181818] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header */}
        <div className="flex items-start justify-between py-8">
          <div>
            <h1 className="text-lg font-medium text-white">Account</h1>
            <p className="text-xs text-gray-500">
              Set up account, join our community and more
            </p>
          </div>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#9ca3af" size={16} />
          </button>
        </div>

        {/* ACCOUNT Section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            ACCOUNT
          </h2>

          <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a]">
            <div className="p-4">
              {/* Your Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-3 py-3 border-b border-[#2a2a2a] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <User size={20} color="#C7EF6B" />
                <div className="flex-1">
                  <h3 className="text-gray-400 font-medium text-sm">
                    Your Profile
                  </h3>
                </div>
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="flex items-center gap-3 py-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Bell size={20} color="#C7EF6B" />
                <div className="flex-1">
                  <h3 className="text-gray-400 font-medium text-sm">
                    Notifications
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* SECURITY Section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            SECURITY
          </h2>

          <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a]">
            <div className="p-4">
              {/* Change Password */}
              <Link
                to="/forgot-password"
                className="flex items-center gap-3 py-3 border-b border-[#2a2a2a] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Key size={20} color="#C7EF6B" />
                <div className="flex-1">
                  <h3 className="text-gray-400 font-medium text-sm">
                    Change Password
                  </h3>
                </div>
              </Link>

              {/* Two Factor Authentication */}
              <div
                onClick={() => navigate("/setup-otp")}
                className="flex items-center gap-3 py-3 border-[#2a2a2a] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Shield size={20} color="#C7EF6B" />
                <div className="flex-1">
                  <h3 className="text-gray-400 font-medium text-sm">
                    Two Factor Authentication
                    <span>
                      {!state.user?.is_totp_enabled && (
                        <span className="text-gray-500 text-sm ml-1">(Not set)</span>
                      )}
                    </span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMMUNITY Section */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            COMMUNITY
          </h2>

          <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a]">
            <div className="px-4 py-5">
              {/* Community Option */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="text-white/90 font-medium text-base">
                    Join our community
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Follow us on social media for new updates
                  </p>

                  {/* Social Icons */}
                  <div className="flex items-center gap-5 mt-3">
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
                          fill="#9ca3af"
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
                        alt="YouTube"
                        className="w-8 h-8"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OTHERS Section */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            OTHERS
          </h2>

          <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a]">
            <div className="p-4">
              {/* Talk to Support */}
              <a
                href="https://t.me/+F0YXOMaiJMxkODVk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 border-b border-[#2a2a2a] cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Headset size={20} color="#C7EF6B" />
                <div className="flex-1">
                  <h3 className="text-gray-400 font-medium text-sm">
                    Talk to Support
                  </h3>
                </div>
              </a>

              {/* Referrals and Affiliates */}
              <a
                href="https://t.me/+F0YXOMaiJMxkODVk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <UserPlus size={20} color="#C7EF6B" />
                <div className="flex-1">
                  <h3 className="text-gray-400 font-medium text-sm">
                    Referrals and Affiliates
                  </h3>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mb-8">
          <button
            onClick={handleSignOut}
            className="w-full text-red-400 flex items-center justify-center space-x-2 hover:text-red-400 transition-colors py-3"
          >
            <LogOut size={16} />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Account Guide"
        content={[
          "Earn money referring friends to Lisar or creating content for Lisar.",
          "Currently coming soon, stay tuned for updates.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/account" />
    </div>
  );
};
