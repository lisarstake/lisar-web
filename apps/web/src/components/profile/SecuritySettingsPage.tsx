import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { BottomNavigation } from "../general/BottomNavigation";
import { TOTPSetupDrawer } from "@/components/auth/TOTPSetupDrawer";
import { SettingsSuccessDrawer } from "@/components/general/SettingsSuccessDrawer";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";

const rowClass =
  "flex w-full items-center rounded-xl bg-[#151515] px-4 py-4 text-left";

export const SecuritySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, forgotPassword, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    message: "",
  });
  const [successDrawer, setSuccessDrawer] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const load = async () => {
      if (state.isLoading) return;

      if (state.user) {
        setIsLoading(false);
        return;
      }

      if (state.isAuthenticated) {
        await refreshUser();
        return;
      }

      navigate("/login");
    };

    load();
  }, [state.user, state.isLoading, state.isAuthenticated, refreshUser, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading security settings..." />;
  }

  const handlePasswordReset = async () => {
    if (!state.user?.email) return;

    try {
      setSendingReset(true);
      const response = await forgotPassword(state.user.email);
      if (!response.success) {
        throw new Error(response.message || "Failed to send reset link");
      }
      setSuccessDrawer({
        isOpen: true,
        message: "Password reset link sent to your email.",
      });
    } catch (error) {
      setErrorDrawer({
        isOpen: true,
        message:
          error instanceof Error
            ? "Sorry an error occurred and password reset link could not be sent, please try again."
            : "Sorry an error occurred and password reset link could not be sent, please try again.",
      });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <h1 className="text-lg font-medium text-white">Security</h1>

        <div className="w-8 h-8" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-3 scrollbar-hide">
        <button className={rowClass} onClick={() => setShowTotpSetup(true)}>
          <BadgeCheck size={20} className="text-[#be860e]" strokeWidth={2.1} />
          <div className="ml-4">
            <p className="text-base font-medium">2-step authentication</p>
            <p className="text-sm text-[#8f9b95]">
              {state.user?.is_totp_enabled
                ? "Enabled on your account"
                : "Extra protection to boost account security"}
            </p>
          </div>
        </button>

        <button className={rowClass} onClick={handlePasswordReset}>
          <KeyRound size={20} className="text-[#ff7a38]" strokeWidth={2.1} />

          <div className="ml-4">
            <p className="text-base font-medium">Change password</p>

            <p className="text-sm text-[#8f9b95] flex items-center gap-1">
              {sendingReset ? (
                <>
                  Sending reset link..
                  <span className="inline-block h-3 w-3 border-2 border-[#8f9b95] border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                "Send reset link to your email"
              )}
            </p>
          </div>
        </button>

      </div>

      <BottomNavigation currentPath="/wallet" />

      <TOTPSetupDrawer
        isOpen={showTotpSetup}
        onClose={() => setShowTotpSetup(false)}
        onComplete={async () => {
          await refreshUser();
          setShowTotpSetup(false);
          setSuccessDrawer({
            isOpen: true,
            message: "Two-factor authentication has been configured.",
          });
        }}
      />

      <SettingsSuccessDrawer
        isOpen={successDrawer.isOpen}
        onClose={() => setSuccessDrawer({ isOpen: false, message: "" })}
        title="Reset link sent"
        message={successDrawer.message}
      />

      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => setErrorDrawer({ isOpen: false, message: "" })}
        message={errorDrawer.message}
      />
    </div>
  );
};
