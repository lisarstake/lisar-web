import React from "react";
import { useNavigate } from "react-router-dom";
import { Orchestrator } from "@/types/wallet";

interface OrchestratorItemProps {
  orchestrator: Orchestrator;
  onClick?: () => void;
}

export const OrchestratorItem: React.FC<OrchestratorItemProps> = ({
  orchestrator,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/validator-details/${orchestrator.id}`);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#C7EF6B]/30 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <div className="text-4xl">{orchestrator.icon}</div>
        <div>
          <h3 className="text-gray-300 font-medium text-base">
            {orchestrator.name}
          </h3>
          <p className="text-gray-400 text-xs">
            Total staked: {orchestrator.totalStaked}LPT
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[#C7EF6B] font-normal text-sm">
          APY: {orchestrator.apy}%
        </p>
        <p className="text-gray-400 text-xs mt-1">Fee: {orchestrator.fee}%</p>
      </div>
    </div>
  );
};
