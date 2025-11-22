import React, { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Copy as CopyIcon,
  Eye,
  EyeOff,
  Check,
  EyeClosed,
  EyeIcon,
  Loader,
  LoaderCircle,
} from "lucide-react";
import { authService } from "@/services/auth";
import { walletService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { totpService } from "@/services/totp";
import { useNavigate } from "react-router-dom";

interface ExportWalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportWalletDrawer: React.FC<ExportWalletDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [exportStep, setExportStep] = useState<
    "intro" | "confirm" | "otp" | "result"
  >("intro");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [exportError, setExportError] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-submit OTP when 6 digits are entered
  useEffect(() => {
    if (otpCode.length === 6 && !isVerifyingOTP && exportStep === "otp") {
      handleOTPVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode, exportStep, isVerifyingOTP]);

  // Focus OTP input when step changes to OTP
  useEffect(() => {
    if (exportStep === "otp" && isOpen) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [exportStep, isOpen]);

  const handleClose = () => {
    setExportStep("intro");
    setExportPassword("");
    setOtpCode("");
    setPrivateKey("");
    setExportError("");
    onClose();
  };

  const handlePasswordConfirm = async () => {
    try {
      setExportError("");
      if (!state.user?.email) {
        setExportError("No user email found.");
        return;
      }
      if (!exportPassword) {
        setExportError("Please enter your password.");
        return;
      }
      setIsVerifying(true);
      const loginResp = await authService.signin({
        email: state.user.email,
        password: exportPassword,
      });
      setIsVerifying(false);
      if (!loginResp.success) {
        setExportError(loginResp.message || "Incorrect password.");
        return;
      }
      // Password verified, proceed to OTP step
      setExportStep("otp");
      setExportError("");
    } catch (e) {
      setIsVerifying(false);
      setExportError("An error occurred. Please try again.");
    }
  };

  const handleOTPPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const sanitized = text.replace(/[^0-9]/g, "").slice(0, 6);
      setOtpCode(sanitized);
      setExportError("");
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  const handleOTPVerify = async () => {
    if (otpCode.length !== 6 || isVerifyingOTP) return;

    setIsVerifyingOTP(true);
    setExportError("");

    try {
      const response = await totpService.verify({ token: otpCode });

      if (response.success) {
        // OTP verified, proceed to export
        handleExport();
      } else {
        setExportError(
          response.error ||
            response.message ||
            "Invalid code. Please try again."
        );
        setOtpCode("");
        otpInputRef.current?.focus();
      }
    } catch (err: any) {
      setExportError(err.message || "Verification failed. Please try again.");
      setOtpCode("");
      otpInputRef.current?.focus();
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSetupOTP = () => {
    const currentPath = window.location.pathname;
    navigate("/setup-otp", {
      state: {
        returnTo: currentPath,
        keepExportDrawerOpen: true,
      },
    });
  };

  const handleExport = async () => {
    try {
      setExportError("");
      if (!state.user?.wallet_id) {
        setExportError("No wallet ID found.");
        return;
      }
      setIsExporting(true);
      const exportResp = await walletService.exportWallet(state.user.wallet_id);
      setIsExporting(false);
      if (exportResp.success && exportResp.privateKey) {
        setPrivateKey(exportResp.privateKey);
        setExportStep("result");
      } else {
        setExportError("Failed to export private key. Try again.");
      }
    } catch (e) {
      setIsExporting(false);
      setExportError("An error occurred. Please try again.");
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            {exportStep === "intro" && "Export your wallet"}
            {exportStep === "confirm" && "Confirm your password"}
            {exportStep === "otp" && "Authenticator Verification"}
            {exportStep === "result" && "Your private key"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-4 px-2 space-y-4">
          {exportStep === "intro" && (
            <p className="text-gray-300 text-base leading-relaxed">
              You are always in control of your funds. Please be careful with
              the next action. Your private key grants full access to your
              wallet don't share it with anyone.
            </p>
          )}

          {exportStep === "confirm" && (
            <div className="space-y-4">
              <p className="text-gray-300 text-base leading-relaxed">
                Enter your account password to confirm your identity.
              </p>
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pr-12 px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#C7EF6B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeClosed className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {exportError && (
                  <p className="text-red-500 text-sm mt-2 pl-1">
                    {exportError}
                  </p>
                )}
              </div>
            </div>
          )}

          {exportStep === "otp" && (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm leading-relaxed">
                Enter the 6-digit code from your authenticator app.
              </p>
              <div className="mt-4">
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                      setOtpCode(value);
                      setExportError("");
                    }}
                    placeholder=""
                    disabled={isVerifyingOTP}
                    className={`w-full px-4 py-3 rounded-lg text-white text-lg tracking-widest bg-[#1a1a1a] border transition-colors ${
                      exportError
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#2a2a2a] focus:border-[#C7EF6B]"
                    } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  <button
                    onClick={handleOTPPaste}
                    disabled={isVerifyingOTP}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7EF6B] text-sm font-medium hover:text-[#B8E55A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Paste
                  </button>
                </div>
                {exportError && (
                  <p className="text-red-500 text-sm mt-2 pl-1">
                    {exportError}
                  </p>
                )}
              </div>
              <div className="text-start">
                <button
                  onClick={handleSetupOTP}
                  className="text-[#C7EF6B] text-sm font-medium hover:underline"
                >
                  No authenticator app? Setup a new one.
                </button>
              </div>
            </div>
          )}

          {exportStep === "result" && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                Your private key has been exported. Keep it safe and never share
                it with anyone.
              </p>
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={privateKey}
                    className="flex-1 px-4 py-3 bg-[#121212] border border-[#2a2a2a] rounded-lg text-gray-100"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(privateKey);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1200);
                    }}
                    className={`px-3 py-3 bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all ${
                      copied ? "scale-105 border-[#C7EF6B]" : ""
                    }`}
                    aria-label={copied ? "Copied" : "Copy private key"}
                  >
                    {copied ? (
                      <Check
                        size={16}
                        color="#C7EF6B"
                        className="animate-pulse"
                      />
                    ) : (
                      <CopyIcon size={16} color="#C7EF6B" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          {exportStep === "intro" && (
            <button
              onClick={() => setExportStep("confirm")}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
            >
              Export Wallet
            </button>
          )}

          {exportStep === "confirm" && (
            <button
              disabled={isVerifying || isExporting}
              onClick={handlePasswordConfirm}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
                isVerifying || isExporting
                  ? "bg-[#636363] text-white cursor-not-allowed"
                  : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              }`}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="animate-spin h-5 w-5 text-white" />
                  Verifying...
                </span>
              ) : isExporting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="animate-spin h-5 w-5 text-white" />{" "}
                  Exporting...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          )}

          {exportStep === "otp" && (
            <button
              disabled={otpCode.length !== 6 || isVerifyingOTP || isExporting}
              onClick={handleOTPVerify}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
                otpCode.length === 6 && !isVerifyingOTP && !isExporting
                  ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                  : "bg-[#636363] text-white cursor-not-allowed"
              }`}
            >
              {isVerifyingOTP ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="animate-spin h-5 w-5 text-white" />
                  Verifying...
                </span>
              ) : isExporting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircle className="animate-spin h-5 w-5 text-white" />
                  Exporting...
                </span>
              ) : (
                "Verify"
              )}
            </button>
          )}

          {exportStep === "result" && (
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
            >
              Done
            </button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
