import React from "react";
import { OrchestratorItem } from "./OrchestratorItem";
import { OrchestratorResponse } from "@/services/delegation/types";
import { AlertCircle, RefreshCw } from "lucide-react";

interface OrchestratorListProps {
  orchestrators: OrchestratorResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  skeletonCount?: number;
  tierNumber?: number;
  tierTitle?: string;
}

export const OrchestratorList: React.FC<OrchestratorListProps> = ({
  orchestrators,
  isLoading,
  error,
  onRetry,
  skeletonCount = 5,
  tierNumber,
  tierTitle,
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 bg-gray-100/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Unexpected error
        </h3>
        <p className="text-gray-400 text-center mb-6 max-w-sm">
          Please check your connection and try again.
        </p>
        <button
          onClick={onRetry}
          className="flex items-center text-sm space-x-2 px-4 py-2 bg-gray-300 text-black rounded-lg font-normal hover:bg-[#B8E55A] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoading
        ? // Show skeleton loading items
          Array.from({ length: skeletonCount }).map((_, index) => (
            <OrchestratorItem
              key={`skeleton-${index}`}
              isLoading={true}
              tourId={index === 0 ? "orchestrator-highlight" : undefined}
            />
          ))
        : orchestrators.map((orchestrator, index) => (
            <OrchestratorItem
              key={orchestrator.address}
              orchestrator={orchestrator}
              tourId={index === 0 ? "orchestrator-highlight" : undefined}
              tierNumber={tierNumber}
              tierTitle={tierTitle}
            />
          ))}
    </div>
  );
};
