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
  Eye,
  EyeOff,
  Check,
  EyeClosed,
  EyeIcon,
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
    "intro"
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportError, setExportError] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setExportStep("intro");
    setExportPassword("");
    setPrivateKey("");
    setExportError("");
    onClose();
  };

  const handleExport = async () => {
    try {
      setExportError("");
      if (!state.user?.email) {
        setExportError("No user email found.");
        return;
      }
      if (!state.user?.wallet_id) {
        setExportError("No wallet ID found.");
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
      setIsVerifying(false);
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
            {exportStep === "result" && "Your private key"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-4 px-2 space-y-4">
          {exportStep === "intro" && (
            <p className="text-gray-300 text-base leading-relaxed">
              You are always in control of your funds. Please be careful with
              the next action. Your private key grants full access to your
              wallet. Do not share it with anyone.
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
              onClick={handleExport}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
                isVerifying || isExporting
                  ? "bg-[#636363] text-white cursor-not-allowed"
                  : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              }`}
            >
              {isVerifying
                ? "Verifying..."
                : isExporting
                  ? "Exporting..."
                  : "Confirm & Export"}
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
