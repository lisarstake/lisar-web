import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { OrchestratorResponse } from "@/services/delegation/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubtleColorForAddress } from "@/lib/qrcode";

interface OrchestratorItemProps {
  orchestrator?: OrchestratorResponse;
  onClick?: () => void;
  isLoading?: boolean;
  tourId?: string;
  tierNumber?: number;
  tierTitle?: string;
}

export const OrchestratorItem: React.FC<OrchestratorItemProps> = ({
  orchestrator,
  onClick,
  isLoading = false,
  tourId,
  tierNumber,
  tierTitle,
}) => {
  const navigate = useNavigate();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  const handleClick = () => {
    if (isLoading || !orchestrator) return;

    if (onClick) {
      onClick();
    } else {
      navigate(`/validator-details/${orchestrator.address}`, {
        state: { tierNumber, tierTitle },
      });
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]"
        data-tour={tourId}
      >
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full bg-[#2a2a2a]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-[#2a2a2a]" />
            <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-16 bg-[#2a2a2a] ml-auto" />
          <Skeleton className="h-3 w-12 bg-[#2a2a2a] ml-auto" />
        </div>
      </div>
    );
  }

  // Get display name from ENS identity
  const displayName =
    orchestrator?.ensIdentity?.name ||
    orchestrator?.ensName ||
    "Unknown Validator";

  return (
    <div
      className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#C7EF6B]/30 transition-colors cursor-pointer"
      onClick={handleClick}
      data-tour={tourId}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#111] shrink-0">
          <img
            src={"/highyield-1.svg"}
            alt={displayName}
            className="w-[75%] h-[75%] object-contain"
          />
        </div>

        <div>
          <h3 className="text-gray-100 font-medium text-base">
            {displayName.length > 20
              ? `${displayName.substring(0, 16)}..`
              : displayName}
          </h3>
          <p className="text-gray-400 text-xs">
            Staked:{" "}
            {Math.round(
              parseFloat(orchestrator?.totalStake || "0")
            ).toLocaleString()}{" "}
            LPT
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[#C7EF6B] font-medium text-sm">
          {orchestrator?.apy || "0%"} APY
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {orchestrator?.reward
            ? (parseFloat(orchestrator.reward) / 10000).toFixed(1) + "%"
            : "0%"}{" "}
          fee
        </p>
      </div>
    </div>
  );
};
