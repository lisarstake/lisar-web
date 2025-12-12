import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Info, CircleQuestionMark } from "lucide-react";
import QRCode from "qrcode";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { EmptyState } from "@/components/general/EmptyState";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { formatEarnings } from "@/lib/formatters";
import { getColorForAddress } from "@/lib/qrcode";

interface StakeEntryItemProps {
  entry: StakeEntry;
  onClick: () => void;
}

const StakeEntryItem: React.FC<StakeEntryItemProps> = ({ entry, onClick }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  const avatar =
    entry.orchestrator?.avatar || entry.orchestrator?.ensIdentity?.avatar;

  useEffect(() => {
    if (!entry.id || !qrCanvasRef.current) return;

    if (avatar && !avatarError) return;

    const qrColor = getColorForAddress(entry.id);

    QRCode.toCanvas(
      qrCanvasRef.current,
      entry.id,
      {
        width: 40,
        margin: 1,
        color: {
          dark: qrColor,
          light: "#1a1a1a",
        },
      },
      (error) => {
        if (error) console.error("QR Code generation error:", error);
      }
    );
  }, [entry.id, avatar, avatarError]);

  return (
    <div
      className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-4 border border-[#2a2a2a] cursor-pointer hover:border-[#C7EF6B]/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {avatar && !avatarError ? (
            <img
              src={avatar}
              alt={entry.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => {
                setAvatarError(true);
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
              <canvas
                ref={qrCanvasRef}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
          <div>
            <p className="text-gray-100 font-medium">
              {entry.name.length > 20
                ? `${entry.name.substring(0, 16)}..`
                : entry.name}
            </p>
            <p className="text-gray-400 text-xs">
              {formatEarnings(entry.yourStake)}{" "}
              {entry.isSavings ? "USDC" : "LPT"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-medium text-sm ${entry.isSavings ? "text-[#86B3F7]" : "text-[#C7EF6B]"}`}
          >
            APY: {(entry.apy * 100).toFixed(1)}%
          </p>
          <p className="text-gray-400 text-xs">
            Fee: {(entry.fee * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

interface StakeEntry {
  id: string;
  name: string;
  yourStake: number;
  apy: number;
  fee: number;
  orchestrator?: any;
  isSavings?: boolean;
}

export const PositionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const walletType =
    (location.state as { walletType?: string })?.walletType || "staking";
  const isSavings = walletType === "savings";

  const { orchestrators } = useOrchestrators();
  const { userDelegation } = useDelegation();

  // Build stake entries
  const stakeEntries: StakeEntry[] = useMemo(() => {
    const entries: StakeEntry[] = [];

    if (userDelegation) {
      const bondedAmount = parseFloat(userDelegation.bondedAmount) || 0;
      const delegateId = userDelegation.delegate?.id || "";

      const orchestrator =
        orchestrators.length > 0
          ? orchestrators.find((orch) => orch.address === delegateId)
          : null;

      const orchestratorName =
        orchestrator?.ensIdentity?.name ||
        orchestrator?.ensName ||
        userDelegation.delegate?.id ||
        "Unknown Orchestrator";

      let apyPercentage = 0;
      if (orchestrator?.apy) {
        const apyValue = orchestrator.apy;
        if (typeof apyValue === "string") {
          apyPercentage = parseFloat(apyValue.replace("%", "")) || 0;
        } else {
          apyPercentage = typeof apyValue === "number" ? apyValue : 0;
        }
      }

      const rewardCutPercentage = orchestrator?.reward
        ? parseFloat(orchestrator.reward) / 10000
        : 0;

      if (delegateId) {
        entries.push({
          id: delegateId,
          name: isSavings ? "Lisar Perena" : orchestratorName,
          yourStake: bondedAmount,
          apy: isSavings ? 0.149 : apyPercentage / 100,
          fee: isSavings ? 0.01 : rewardCutPercentage,
          orchestrator: orchestrator || null,
          isSavings,
        });
      }
    }

    return entries;
  }, [userDelegation, orchestrators, isSavings]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleStakeClick = (stakeId: string) => {
    navigate(`/validator-details/${stakeId}`);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between py-8 mb-2">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">My Positions</h1>
          <button
            onClick={() => setShowHelpDrawer(true)}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>

        {/* Stakes List */}
        <div className="mb-6">
          <h2 className="text-white/70 text-sm font-medium mb-4 px-2">
            Active position
          </h2>
          {stakeEntries.length === 0 ? (
            <EmptyState
              icon={Info}
              iconColor="#86B3F7"
              iconBgColor="#2a2a2a"
              title="No active positions"
              description="You don't have any active stakes yet. Start staking to earn rewards."
            />
          ) : (
            <div className="space-y-3">
              {stakeEntries.map((entry) => (
                <StakeEntryItem
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleStakeClick(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="My Positions"
        content={[
          "View all your active staking positions across different validators.",
          "Each position shows the validator name, your staked amount, APY, and fee.",
          "Click on any position to view detailed information and manage your stake.",
        ]}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
