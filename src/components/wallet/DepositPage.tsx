import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const DepositPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [copied, setCopied] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const walletAddress = "0x6f71...a98o";
  const fullWalletAddress = "0x6f71a98o1234567890abcdef1234567890abcdef";

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullWalletAddress,
        {
          width: 192, // 48 * 4 for high resolution
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
    navigate(`/stake/${validatorId}`);
  };

  const handleCopyClick = () => {
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

        <h1 className="text-lg font-medium text-white">Deposit</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* QR Code and Address Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
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
          <p className="text-white text-lg font-medium">{walletAddress}</p>
        </div>

        {/* Network Information */}
        <div className="text-center mb-6">
          <p className="text-white/70 text-sm">Network: Arbitrum One</p>
        </div>

        {/* Warning Note */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 max-w-sm">
          <p className="text-yellow-400 text-xs text-center">
            Note: If you do not receive your deposit within 10 minutes, please
            contact support.
          </p>
        </div>
      </div>

      {/* Copy Button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleCopyClick}
          className="w-full py-4 rounded-xl font-semibold text-lg bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center space-x-2"
        >
          {copied ? (
            <>
              <Check size={20} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={20} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="About Lisar"
        subtitle="A quick guide on how to use the deposit feature"
        content={[
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
