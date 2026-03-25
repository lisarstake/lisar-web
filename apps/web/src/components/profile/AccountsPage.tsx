import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Clock } from "lucide-react";

interface AccountCardProps {
  flag: string;
  title: string;
  description: string;
  accountNumber?: string;
  bankName?: string;
  hasAccount: boolean;
  onRequestAccount?: () => void;
  isComingSoon?: boolean;
  buttonText?: string;
}

const AccountCard: React.FC<AccountCardProps> = ({
  flag,
  title,
  description,
  accountNumber,
  bankName,
  hasAccount,
  onRequestAccount,
  isComingSoon = false,
  buttonText,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (accountNumber) {
      const numberOnly = accountNumber.replace(/[^0-9]/g, "");
      await navigator.clipboard.writeText(numberOnly);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-5 bg-[#13170a] rounded-xl">
      <div className="flex items-center gap-2">
        <img src={flag} className="w-7 h-7" />
        <p className="text-white text-lg font-medium">{title}</p>
      </div>
      <p className="text-center text-sm text-white/50">{description}</p>

      {hasAccount && accountNumber ? (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-white/10 rounded-full text-white"
        >
          <span>{accountNumber}</span>
          {copied ? (
            <Check size={16} className="text-[#C7EF6B]" />
          ) : (
            <Copy size={16} className="text-white/60" />
          )}
        </button>
      ) : isComingSoon ? (
        <button className="flex gap-1 items-center text-sm font-semibold px-4 py-2 bg-white rounded-full text-black">
          Coming soon <Clock size={16} />
        </button>
      ) : (
        <button
          onClick={onRequestAccount}
          className="text-sm font-semibold px-4 py-2 bg-white rounded-full text-black"
        >
          {buttonText || "Request Account"}
        </button>
      )}
    </div>
  );
};

export const AccountsPage: React.FC = () => {
  const navigate = useNavigate();

  const [hasNairaAccount] = useState(true);
  const [hasDollarAccount] = useState(false);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleRequestAccount = () => {
    console.log("Request account clicked");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-medium text-white">Accounts</h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <AccountCard
          flag="/ng_flag.png"
          title="Naira Account"
          description="Receive NGN from any bank or mobile money to instantly top up your Lisar NGN balance"
          accountNumber="Nomba MFB - 7040920728"
          bankName="Opay"
          hasAccount={hasNairaAccount}
          onRequestAccount={handleRequestAccount}
        />

        <AccountCard
          flag="/us_flag.png"
          title="Dollar Account"
          description="Receive USD payments for freelance gigs instantly to your Lisar USD balance"
          hasAccount={hasDollarAccount}
          onRequestAccount={handleRequestAccount}
          isComingSoon
        />

        <AccountCard
          flag="/crypto.png"
          title="Crypto Wallet"
          description="Receive crypto tokens from any external wallet to top up your Lisar wallet"
          hasAccount={false}
          isComingSoon
        />
      </div>
    </div>
  );
};
