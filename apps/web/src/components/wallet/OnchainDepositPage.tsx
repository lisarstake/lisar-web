import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";

export const OnchainDepositPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useAuth();

  const locationState = location.state as {
    walletType?: string;
  } | null;
  const walletType = locationState?.walletType;
  const isStables = walletType === "savings";
  const tokenName = isStables ? "USDC" : "Livepeer (LPT)";
  const networkName = isStables ? "Solana" : "Arbitrum One";

  const fullWalletAddress = state.user?.wallet_address || "";
  const walletAddress = fullWalletAddress
    ? `${fullWalletAddress.slice(0, 6)}...${fullWalletAddress.slice(-4)}`
    : "";

  useEffect(() => {
    if (canvasRef.current && fullWalletAddress) {
      QRCode.toCanvas(
        canvasRef.current,
        fullWalletAddress,
        {
          width: 192,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [fullWalletAddress]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCopyClick = () => {
    if (!fullWalletAddress) return;
    navigator.clipboard.writeText(fullWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">Deposit Address</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* QR Code and Address Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="flex items-center gap-2 mb-3">
          <img
            src={isStables ? "/usdc.svg" : "/livepeer.webp"}
            alt={isStables ? "USDC" : "LPT"}
            className="w-6 h-6"
          />
          <p className="text-xl font-semibold text-gray-100">{tokenName}</p>
        </div>
        {/* QR Code */}
        <div className="bg-white rounded-xl p-2 mb-6">
          <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full rounded-lg"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        </div>

        {/* Wallet Address */}
        <div className="text-center mb-2">
          <p className="text-white text-lg font-medium">
            {walletAddress || "No address"}
          </p>
        </div>

        {/* Network Information */}
        <div className="text-center mb-6">
          <p className="text-white/70 text-sm">Network: {networkName}</p>
        </div>

        {/* Warning Note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 max-w-sm">
          <p className="text-yellow-400 text-xs text-center">
            Scan the QR code or copy the address to deposit. Always ensure you
            are depositing the correct token and network.
          </p>
        </div>
      </div>

      {/* Copy Button */}
      <div className="px-6 pb-24">
        <button
          onClick={handleCopyClick}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center space-x-2"
          disabled={!fullWalletAddress}
        >
          {copied ? (
            <>
              <Check size={20} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={20} />
              <span>{fullWalletAddress ? "Copy" : "No address"}</span>
            </>
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Deposit Guide"
        content={[
          `Send ${isStables ? "USDC" : "LPT"} tokens to this address to add funds to your Lisar wallet.`,
          "Copy the address or scan the QR code with your mobile wallet to send tokens.",
          `Only send ${isStables ? "USDC" : "LPT"} tokens to this address to avoid losing funds.`,
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

