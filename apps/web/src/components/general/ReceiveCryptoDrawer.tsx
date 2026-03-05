import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

interface CryptoToken {
  symbol: string;
  name: string;
  icon: string;
  network: string;
  networkType: "solana" | "ethereum" | "arbitrum";
}

const CRYPTO_TOKENS: CryptoToken[] = [
  {
    symbol: "USDC",
    name: "USD coin",
    icon: "/usdc.svg",
    network: "Solana",
    networkType: "solana",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    icon: "/usdt.svg",
    network: "Solana",
    networkType: "solana",
  },
  {
    symbol: "LPT",
    name: "Livepeer token",
    icon: "/livepeer.webp",
    network: "Arbitrum",
    networkType: "arbitrum",
  },
];

interface ReceiveCryptoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveCryptoDrawer: React.FC<ReceiveCryptoDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedToken, setSelectedToken] = useState<CryptoToken | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { solanaWalletAddress, ethereumWalletAddress } = useWallet();
  const { state } = useAuth();

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  useEffect(() => {
    if (selectedToken) {
      if (selectedToken.symbol === "LPT") {
        setWalletAddress(state.user?.wallet_address || "");
      } else {
        if (selectedToken.networkType === "solana" && solanaWalletAddress) {
          setWalletAddress(solanaWalletAddress);
        } else if (
          selectedToken.networkType === "ethereum" &&
          ethereumWalletAddress
        ) {
          setWalletAddress(ethereumWalletAddress);
        }
      }
    }
  }, [
    selectedToken,
    solanaWalletAddress,
    ethereumWalletAddress,
    state.user?.wallet_address,
  ]);

  useEffect(() => {
    if (canvasRef.current && walletAddress) {
      QRCode.toCanvas(
        canvasRef.current,
        walletAddress,
        {
          width: 180,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          // QR code generation failed
        },
      );
    }
  }, [walletAddress]);

  const handleTokenSelect = (token: CryptoToken) => {
    setSelectedToken(token);
    setSelectedNetwork(token.network);
  };

  const handleBack = () => {
    setSelectedToken(null);
    setCopied(false);
    setWalletAddress("");
  };

  const handleClose = () => {
    setSelectedToken(null);
    setCopied(false);
    setWalletAddress("");
    onClose();
  };

  const handleCopy = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="bg-[#050505]">
        <DrawerHeader className={`relative ${!selectedToken ? "mb-7" : ""}`}>
          <div className="flex items-center">
            {selectedToken && (
              <button
                onClick={handleBack}
                className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
              >
                <ArrowLeft className="text-white" size={22} />
              </button>
            )}
          </div>

          <DrawerTitle className="absolute left-1/2 -translate-x-1/2 font-medium text-lg text-white">
            {selectedToken ? `Receive ${selectedToken.symbol}` : "Select Token"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="pt-2 space-y-3 pb-6">
          {!selectedToken ? (
            CRYPTO_TOKENS.map((token) => (
              <button
                key={token.symbol}
                onClick={() => handleTokenSelect(token)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#13170a] hover:bg-[#151515] transition-colors text-left"
              >
                <img
                  src={token.icon}
                  alt={token.symbol}
                  className="w-10 h-10"
                />
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">
                    {token.symbol}
                  </span>
                  <p className="text-white/50 text-xs">{token.name}</p>
                </div>
                <span className="text-white/50 text-xs">{token.network}</span>
              </button>
            ))
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-lg p-2">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-center">
                  <p className="text-sm font-medium text-white/80">
                    Network: {selectedNetwork}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopy}
                  disabled={!walletAddress}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#121212] rounded-lg disabled:opacity-50"
                >
                  <span className="text-white text-sm font-mono">
                    {truncatedAddress || "No address"}
                  </span>
                  {copied ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-white/60" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
