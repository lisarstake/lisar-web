/**
 * TOTP Setup Drawer
 * Drawer component for setting up 2FA with authenticator apps
 */

import React, { useState, useEffect } from "react";
import { Copy, Check, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";
import { LoadingSpinner } from "@/components/general/LoadingSpinner";
import { totpService } from "@/services/totp";

interface TOTPSetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  preserveState?: Record<string, any>;
}

export const TOTPSetupDrawer: React.FC<TOTPSetupDrawerProps> = ({
  isOpen,
  onClose,
  onComplete,
  preserveState,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (isOpen) {
      setupTOTP();
    } else {
      setQrCode("");
      setOtpauthUrl("");
      setSecret("");
      setCopied(false);
      setIsLoading(true);
    }
  }, [isOpen]);

  const setupTOTP = async () => {
    try {
      setIsLoading(true);
      const response = await totpService.setup();

      if (response.success) {
        setQrCode(response.qr);
        setOtpauthUrl(response.otpauth_url);
        
        // Extract and decode the secret from otpauth URL
        const secretMatch = response.otpauth_url.match(/secret=([^&]+)/);
        if (secretMatch && secretMatch[1]) {
          // URL decode the secret in case it's encoded
          const extractedSecret = decodeURIComponent(secretMatch[1]);
          setSecret(extractedSecret);
        }
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
        message:
          error.message || "An error occurred during setup. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      if (secret) {
        await navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="bg-[#1a1a1a] border-[#2a2a2a] max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="relative">
            <DrawerTitle className="text-xl font-semibold text-white/90 text-left">
              Setup Authenticator App
            </DrawerTitle>
            <p className="text-gray-400 text-sm text-left mt-2">
              Scan the QR code with your authenticator app to add your account.
            </p>
          </DrawerHeader>

          <div className=" pb-2 space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
               <LoadingSpinner message="Setting up authenticator..." fullScreen={false} />
              </div>
            ) : (
              <>
                {/* Step 2 */}
                <div className="space-y-3">
                  {/* QR Code */}
                  {qrCode && (
                    <div className="flex justify-center py-6">
                      <div className="bg-white p-4 rounded-lg">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
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
                        {secret || ""}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        disabled={!secret}
                        className="shrink-0 p-2 hover:bg-[#2a2a2a] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              </>
            )}
          </div>

          <DrawerFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Verification
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
    </>
  );
};
