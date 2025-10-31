import React from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorResponse } from "@/services/delegation/types";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleClick = () => {
    if (isLoading || !orchestrator) return;
    
    if (onClick) {
      onClick();
    } else {
      // Use address as identifier for now
      navigate(`/validator-details/${orchestrator.address}`);
    }
  };

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

  return (
    <div
      className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#C7EF6B]/30 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C7EF6B] to-[#B8E55A] flex items-center justify-center">
          <span className="text-black text-lg font-bold">
            {orchestrator?.ensName?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <h3 className="text-gray-100 font-medium text-base">
            {orchestrator?.ensName && orchestrator.ensName.length > 20 
              ? `${orchestrator.ensName.substring(0, 16)}..` 
              : (orchestrator?.ensName || 'Unknown Validator')}
          </h3>
          <p className="text-gray-400 text-xs">
            Staked: {Math.round(parseFloat(orchestrator?.totalStake || '0')).toLocaleString()} LPT
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[#C7EF6B] font-medium text-sm">
          APY: {orchestrator?.apy || '0%'}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Fee: {orchestrator?.reward ? (parseFloat(orchestrator.reward) / 10000).toFixed(1) + '%' : '0%'}
        </p>
      </div>
    </div>
  );
};
