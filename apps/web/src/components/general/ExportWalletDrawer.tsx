import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Copy as CopyIcon,
  Check,
  EyeClosed,
  EyeIcon,
  LoaderCircle,
} from "lucide-react";
import { authService } from "@/services/auth";
import { walletService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

interface ExportWalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportWalletDrawer: React.FC<ExportWalletDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useAuth();
  const [exportStep, setExportStep] = useState<"intro" | "confirm" | "result">(
    "intro",
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportErrorTone, setExportErrorTone] = useState<"warning" | "error">(
    "error",
  );
  const [privateKey, setPrivateKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const getErrorText = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "message" in value) {
      const message = (value as { message?: unknown }).message;
      if (typeof message === "string") return message;
    }
    return "";
  };

  const isInvalidCredentialsError = (message: string): boolean => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("invalid") ||
      normalized.includes("incorrect") ||
      normalized.includes("wrong password") ||
      normalized.includes("invalid credential") ||
      normalized.includes("unauthorized") ||
      normalized.includes("password")
    );
  };

  const handleClose = () => {
    setExportStep("intro");
    setExportPassword("");
    setPrivateKey("");
    setExportError("");
    setExportErrorTone("error");
    onClose();
  };

  const handlePasswordConfirm = async () => {
    try {
      setExportError("");
      setExportErrorTone("error");
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
        const backendMessage = [
          loginResp.message,
          getErrorText(loginResp.error),
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

        if (isInvalidCredentialsError(backendMessage)) {
          setExportErrorTone("warning");
          setExportError("Wrong password. Please try again.");
        } else {
          setExportErrorTone("error");
          setExportError("An error occurred. Please try again.");
        }
        return;
      }

      await handleExport();
      setExportError("");
    } catch (e) {
      setIsVerifying(false);
      setExportErrorTone("error");
      setExportError("An error occurred. Please try again.");
    }
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

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleDrawerOpenChange}>
      <DrawerContent className="bg-[#050505] border-[#505050] max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl font-semibold text-white">
            {exportStep === "intro" && "Export your wallet"}
            {exportStep === "confirm" && "Confirm your password"}
            {exportStep === "result" && "Your private key"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-4 px-2 space-y-4">
          {exportStep === "intro" && (
            <p className="text-gray-300 text-sm leading-relaxed">
              You are always in control of your funds. Please be careful with
              the next action. Your private key grants full access to your
              wallet don't share it with anyone.
            </p>
          )}

          {exportStep === "confirm" && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                Enter your account password to confirm your identity.
              </p>
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pr-12 px-4 py-3 bg-[#151515] border border-[#505050] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#C7EF6B]"
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
                  <p
                    className={`text-sm mt-2 pl-1 ${exportErrorTone === "warning"
                      ? "text-amber-300"
                      : "text-red-500"
                      }`}
                  >
                    {exportError}
                  </p>
                )}
              </div>
            </div>
          )}

          {exportStep === "result" && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                Your private key is shown below. Ensure to keep it safe and never share
                it with anyone.
              </p>
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={privateKey}
                    className="flex-1 px-4 py-3 bg-[#151515] border border-[#505050] rounded-lg text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(privateKey);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1200);
                    }}
                    className={`px-3 py-3 bg-[#1f1f1f] border border-[#505050] rounded-lg hover:bg-[#505050] transition-all ${copied ? "scale-105 border-[#C7EF6B]" : ""
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
              type="button"
              onClick={() => setExportStep("confirm")}
              className="w-full py-3 rounded-full font-medium text-base bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
            >
              Export Wallet
            </button>
          )}

          {exportStep === "confirm" && (
            <button
              type="button"
              disabled={isVerifying || isExporting}
              onClick={handlePasswordConfirm}
              className={`w-full py-3 rounded-full font-medium text-base transition-colors ${isVerifying || isExporting
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

          {exportStep === "result" && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-full font-medium text-base bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
            >
              Done
            </button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
