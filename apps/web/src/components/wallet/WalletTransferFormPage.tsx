import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Info, ClipboardPaste } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { usePrices } from "@/hooks/usePrices";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";

type TransferMode = "deposit" | "withdraw";
type TransferAsset = "naira" | "crypto";

const BANK_OPTIONS = ["Moniepoint", "Access Bank", "GTBank"];

type SupportedToken = "USDC" | "USDT" | "LPT";
type SupportedNetwork = "Solana" | "Arbitrum";

const TOKEN_CONFIG: Record<
  SupportedToken,
  { icon: string; networks: SupportedNetwork[] }
> = {
  USDC: { icon: "/usdc.svg", networks: ["Solana"] },
  USDT: { icon: "/usdt.svg", networks: ["Solana"] },
  LPT: { icon: "/livepeer.webp", networks: ["Arbitrum"] },
};

export const WalletTransferFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, asset } = useParams<{
    mode: TransferMode;
    asset: TransferAsset;
  }>();
  const { state } = useAuth();
  const { solanaWalletAddress } = useWallet();
  const { prices } = usePrices();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const safeMode: TransferMode = mode === "withdraw" ? "withdraw" : "deposit";
  const safeAsset: TransferAsset = asset === "crypto" ? "crypto" : "naira";

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState(BANK_OPTIONS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SupportedToken>("USDT");
  const [selectedNetwork, setSelectedNetwork] =
    useState<SupportedNetwork>("Solana");
  const [instantOfframp, setInstantOfframp] = useState(false);
  const [offrampAddress, setOfframpAddress] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (instantOfframp) {
      setTimerSeconds(600);
    } else {
      setTimerSeconds(0);
    }
  }, [instantOfframp]);

  useEffect(() => {
    if (!instantOfframp || timerSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setInstantOfframp(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [instantOfframp, timerSeconds]);

  const linked = state.user?.linked_account;
  const depositBankName = linked?.bank_name || "Nomba Microfinance Bank";
  const depositAccountNumber = linked?.account_number || "00228811900";
  const depositAccountName = state.user?.full_name || "Lisar User";

  const currentTokenConfig = TOKEN_CONFIG[selectedToken];
  const availableNetworks = currentTokenConfig.networks;

  useEffect(() => {
    if (!availableNetworks.includes(selectedNetwork)) {
      setSelectedNetwork(availableNetworks[0]);
    }
  }, [availableNetworks, selectedNetwork]);

  const cryptoDepositAddress = useMemo(() => {
    if (selectedNetwork === "Solana") {
      return solanaWalletAddress || "No wallet address";
    }
    return state.user?.wallet_address || "No wallet address";
  }, [selectedNetwork, solanaWalletAddress, state.user?.wallet_address]);

  const generateOfframpAddress = (network: SupportedNetwork) => {
    if (network === "Solana") {
      const alphabet =
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let value = "";
      for (let i = 0; i < 44; i += 1) {
        value += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      return value;
    }

    const hex = "0123456789abcdef";
    let value = "0x";
    for (let i = 0; i < 40; i += 1) {
      value += hex[Math.floor(Math.random() * hex.length)];
    }
    return value;
  };

  useEffect(() => {
    if (!instantOfframp) return;
    setOfframpAddress(generateOfframpAddress(selectedNetwork));
  }, [instantOfframp, selectedNetwork]);

  const effectiveDepositAddress =
    instantOfframp && offrampAddress ? offrampAddress : cryptoDepositAddress;

  const truncatedCryptoAddress = useMemo(() => {
    if (
      !effectiveDepositAddress ||
      effectiveDepositAddress === "No wallet address"
    ) {
      return effectiveDepositAddress;
    }
    return `${effectiveDepositAddress.slice(0, 10)}...${effectiveDepositAddress.slice(-15)}`;
  }, [effectiveDepositAddress]);

  const conversionRateNgn = useMemo(() => {
    const ngnRate = prices.ngn || 0;
    if (!ngnRate) return 0;
    if (selectedToken === "LPT") {
      return (prices.lpt || 0) * ngnRate;
    }
    return ngnRate;
  }, [prices.ngn, prices.lpt, selectedToken]);

  useEffect(() => {
    if (safeMode !== "deposit" || safeAsset !== "crypto") return;
    if (!qrCanvasRef.current || !effectiveDepositAddress) return;

    QRCode.toCanvas(qrCanvasRef.current, effectiveDepositAddress, {
      width: 160,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  }, [safeMode, safeAsset, effectiveDepositAddress]);

  const pageTitle = useMemo(() => {
    if (safeMode === "deposit" && safeAsset === "naira") return "Deposit Naira";
    if (safeMode === "deposit" && safeAsset === "crypto")
      return "Deposit Crypto";
    if (safeMode === "withdraw" && safeAsset === "naira") return "Send Naira";
    return "Send Crypto";
  }, [safeMode, safeAsset]);

  const isWithdraw = safeMode === "withdraw";
  const isDisabled = isWithdraw
    ? !amount.trim() ||
      (safeAsset === "crypto"
        ? !walletAddress.trim()
        : !bankName.trim() || !accountNumber.trim() || !accountName.trim())
    : false;

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          >
            <ArrowLeft className="text-white" size={22} />
          </button>
          <h1 className="text-lg font-medium">{pageTitle}</h1>
          <div className="w-8" />
        </div>

        <div className="px-6 pb-32">
          {isWithdraw ? (
            <div className="space-y-5 pt-4">
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Amount {safeAsset === "naira" ? "(NGN)" : ""}
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={safeAsset === "naira" ? "0" : "0"}
                className="w-full rounded-lg bg-[#13170a] px-4 py-3.5 text-base text-white outline-none"
              />
            </div>

            {safeAsset === "naira" ? (
              <>
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Bank
                  </label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger className="w-full bg-[#13170a] text-white border-none py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#13170a] text-white border-none">
                      {BANK_OPTIONS.map((bank) => (
                        <SelectItem
                          key={bank}
                          value={bank}
                          className="focus:bg-white/10 focus:text-white"
                        >
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Account number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full rounded-lg bg-[#13170a] px-4 py-3.5 text-base text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Account name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Enter account name"
                    className="w-full rounded-lg bg-[#13170a] px-4 py-3.5 text-base text-white outline-none"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Wallet address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Paste wallet address"
                    className="w-full rounded-lg bg-[#13170a] pr-12 pl-4 py-3.5 text-base text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setWalletAddress(text);
                      } catch (err) {
                        console.error("Failed to read clipboard");
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <ClipboardPaste size={18} className="text-white/60" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : safeAsset === "naira" ? (
          <div className="pt-4 space-y-5">
            <div className="rounded-lg bg-[#13170a] p-3">
              <img
                src="/deposit-naira.png"
                alt="Deposit Naira"
                className="w-full rounded-lg object-cover"
              />
            </div>
            <div className="rounded-lg bg-[#13170a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Bank name</p>
                <p className="text-base text-white">{depositBankName}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Account name</p>
                <p className="text-base text-white">{depositAccountName}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">Account number</p>
                <button
                  onClick={() => handleCopy(depositAccountNumber)}
                  className="flex items-center gap-2 "
                >
                  <span className="text-base text-white">
                    {depositAccountNumber}
                  </span>
                  {copied ? (
                    <Check size={16} className="text-[#c7ef6b]" />
                  ) : (
                    <Copy size={16} className="text-white/70" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-white/60">
              Transfer from your bank app to this account. Your deposit will be
              credited automatically once payment is confirmed.
            </p>
          </div>
        ) : (
          <div className="pt-4 space-y-5">
            <div className="rounded-lg bg-[#13170a] p-3">
              <p className="text-sm text-white/60">Cryptocurrency</p>
              <Select
                value={selectedToken}
                onValueChange={(val) => setSelectedToken(val as SupportedToken)}
              >
                <SelectTrigger className="bg-transparent text-white border-none w-full px-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#13170a] text-white w-full">
                  <SelectItem
                    value="USDC"
                    className="focus:bg-white/10 focus:text-white"
                  >
                    USDC
                  </SelectItem>
                  <SelectItem
                    value="USDT"
                    className="focus:bg-white/10 focus:text-white"
                  >
                    USDT
                  </SelectItem>
                  <SelectItem
                    value="LPT"
                    className="focus:bg-white/10 focus:text-white"
                  >
                    LPT
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-[#13170a] p-3">
              <p className="text-sm text-white/60">Network</p>
              <Select
                value={selectedNetwork}
                onValueChange={(val) =>
                  setSelectedNetwork(val as SupportedNetwork)
                }
              >
                <SelectTrigger className="bg-transparent text-white border-none w-full px-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#13170a] text-white w-full">
                  {availableNetworks.map((network) => (
                    <SelectItem
                      key={network}
                      value={network}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-[#13170a] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white">Instant Offramp</p>
                  <Tooltip
                    content="Tokens sent will be converted to fiat and credited to your NGN wallet."
                    centered
                  >
                    <Info size={14} className="text-white/50 cursor-help" />
                  </Tooltip>
                </div>
                <Switch
                  checked={instantOfframp}
                  onCheckedChange={setInstantOfframp}
                />
              </div>
              {instantOfframp && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/60">
                    Rate ≈{" "}
                    <span className="text-[#c7ef6b]">
                      ₦
                      {conversionRateNgn.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>

                  <div className="h-3 w-px bg-white/20" />

                  <p className="text-xs text-white/60">
                    Complete deposit within{" "}
                    <span className="text-[#c7ef6b] font-medium">
                      {formatTimer(timerSeconds)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-white/60">Wallet address</p>
              <div className="rounded-lg bg-[#13170a] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base text-white/80 break-all">
                    {truncatedCryptoAddress}
                  </p>
                  <button
                    onClick={() => handleCopy(effectiveDepositAddress)}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check size={16} className="text-[#c7ef6b]" />
                    ) : (
                      <Copy size={16} className="text-white/70" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-3">
                <canvas ref={qrCanvasRef} className="h-40 w-40" />
              </div>
            </div>

            <div className="rounded-lg bg-[#13170a] p-4 mb-10">
              <p className="text-sm text-[#c7ef6b] font-medium mb-2">
                Important
              </p>
              <ul className="space-y-2 text-xs text-white/75 list-disc pl-5">
                <li>
                  Send only {selectedToken} on the {selectedNetwork} network to
                  this address.
                </li>
                <li>
                  Sending unsupported tokens or using the wrong network may
                  result in loss of funds.
                </li>
              </ul>
            </div>
          </div>
          )}
        </div>
      </div>

      {isWithdraw && (
        <div className="fixed bottom-28 left-0 right-0 px-6 z-20">
          <button
            disabled={isDisabled}
            className={`h-14 w-full rounded-full text-base font-semibold transition-colors ${
              isDisabled
                ? "bg-[#2a2a2a] text-white/40"
                : "bg-[#c7ef6b] text-black"
            }`}
          >
            Confirm
          </button>
        </div>
      )}

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
