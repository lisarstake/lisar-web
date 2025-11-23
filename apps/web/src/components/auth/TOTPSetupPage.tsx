/**
 * TOTP Setup Page
 * Page for setting up 2FA with authenticator apps
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Copy, Check } from "lucide-react";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { totpService } from "@/services/totp";

interface TOTPSetupPageProps {
  onComplete?: () => void;
  redirectOnComplete?: string;
  redirectOnCancel?: string;
  preserveState?: Record<string, any>;
}

export const TOTPSetupPage: React.FC<TOTPSetupPageProps> = ({
  onComplete,
  redirectOnComplete = "/verify-otp",
  redirectOnCancel = "/profile",
  preserveState,
}) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    setupTOTP();
  }, []);

  const setupTOTP = async () => {
    try {
      setIsLoading(true);
      const response = await totpService.setup();

      if (response.success) {
        setQrCode(response.qr);
        setOtpauthUrl(response.otpauth_url);
      } else {
        setErrorDrawer({
          isOpen: true,
          title: "Setup Failed",
          message: "Failed to generate authenticator setup. Please try again.",
        });
      }
    } catch (error: any) {
      setErrorDrawer({
        isOpen: true,
        title: "Something went wrong",
        message: error.message || "An error occurred during setup. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    // If coming from export drawer, go back to the returnTo path instead of history
    if (preserveState?.keepExportDrawerOpen && preserveState?.returnTo) {
      navigate(preserveState.returnTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleCopyUrl = async () => {
    try {
      // Extract the secret from the otpauth URL
      const secretMatch = otpauthUrl.match(/secret=([^&]+)/);
      const secret = secretMatch ? secretMatch[1] : "";

      if (secret) {
        await navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleContinue = () => {
    if (onComplete) {
      onComplete();
    } else {
      // If coming from export drawer, return directly to the drawer (skip verify-otp)
      if (preserveState?.keepExportDrawerOpen) {
        navigate(redirectOnComplete, {
          state: {
            ...preserveState,
            fromSetup: true,
          },
          replace: true, // Replace to prevent back button loops
        });
      } else {
        // Normal flow: go to verify-otp page
        navigate(redirectOnComplete, {
          state: {
            fromSetup: true,
            ...(preserveState && { ...preserveState }),
          },
        });
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Setting up authenticator..." />;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="w-full space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-xl font-semibold text-white/90 mb-2">
              Setup Authenticator App
            </h1>
            <p className="text-gray-400 text-sm">
              Scan the QR code with your authenticator app to add your account.
            </p>
          </div>

          {/* Step 1 */}
          <div className="space-y-3">
            <h2 className="text-white text-base font-medium">
              Step 1: Download an Authenticator App
            </h2>
            <p className="text-gray-400 text-sm">
              Download and install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3">
            <h2 className="text-white text-base font-medium">
              Step 2: Scan QR Code
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Open your authenticator app and scan this QR code.
            </p>

            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center py-6">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
            )}

            {/* Manual Entry Option */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                Can't scan? Enter this code manually:
              </p>
              <div className="flex items-center gap-2 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                <code className="flex-1 text-[#C7EF6B] text-sm font-mono break-all">
                  {otpauthUrl.match(/secret=([^&]+)/)?.[1] || ""}
                </code>
                <button
                  onClick={handleCopyUrl}
                  className="shrink-0 p-2 hover:bg-[#2a2a2a] rounded transition-colors"
                >
                  {copied ? (
                    <Check size={18} color="#C7EF6B" />
                  ) : (
                    <Copy size={18} color="#C7EF6B" />
                  )}
                </button>
              </div>
            </div>
          </div>

        

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
          >
            {preserveState?.keepExportDrawerOpen
              ? "Return to Export"
              : "Continue to Verification"}
          </button>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              Keep your authenticator app secure and backed up
            </p>
          </div>
        </div>
      </div>

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => {
          setErrorDrawer({ isOpen: false, title: "", message: "" });
        }}
        title={errorDrawer.title}
        message={errorDrawer.message}
        onRetry={setupTOTP}
        retryText="Try Again"
      />
    </div>
  );
};

