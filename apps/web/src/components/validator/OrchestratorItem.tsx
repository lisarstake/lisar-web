import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { OrchestratorResponse } from "@/services/delegation/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getColorForAddress } from "@/lib/qrcode";

interface OrchestratorItemProps {
  orchestrator?: OrchestratorResponse;
  onClick?: () => void;
  isLoading?: boolean;
}

export const OrchestratorItem: React.FC<OrchestratorItemProps> = ({
  orchestrator,
  onClick,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  const handleClick = () => {
    if (isLoading || !orchestrator) return;

    if (onClick) {
      onClick();
    } else {
      navigate(`/validator-details/${orchestrator.address}`);
    }
  };

  // Generate QR code when there's no avatar or avatar fails to load
  useEffect(() => {
    if (!orchestrator || !qrCanvasRef.current) return;

    const avatar = orchestrator?.avatar || orchestrator?.ensIdentity?.avatar;
    if (avatar && !avatarError) return;

    const address = orchestrator.address;
    if (!address) return;

    const qrColor = getColorForAddress(address);

    QRCode.toCanvas(
      qrCanvasRef.current,
      address,
      {
        width: 48,
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
  }, [orchestrator, avatarError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
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
  const avatar = orchestrator?.avatar || orchestrator?.ensIdentity?.avatar;
  const displayInitial = displayName.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#C7EF6B]/30 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {avatar && !avatarError ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
            onError={() => {
              setAvatarError(true);
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
            <canvas ref={qrCanvasRef} className="w-full h-full rounded-full" />
          </div>
        )}
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
          APY: {orchestrator?.apy || "0%"}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Fee:{" "}
          {orchestrator?.reward
            ? (parseFloat(orchestrator.reward) / 10000).toFixed(1) + "%"
            : "0%"}
        </p>
      </div>
    </div>
  );
};
