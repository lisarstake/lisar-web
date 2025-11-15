import React from "react";
import { DelegatorReward } from "@/services/delegation/types";

interface ValidatorRewardsChartProps {
  rewards: DelegatorReward[];
  isLoading: boolean;
}

export const ValidatorRewardsChart: React.FC<ValidatorRewardsChartProps> = ({
  rewards,
  isLoading,
}) => {
  return (
    <div className="px-6 py-1">
      <div className="bg-[#1a1a1a] rounded-xl">
        <div className="h-32 bg-[#0a0a0a] rounded-lg relative overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C7EF6B]"></div>
            </div>
          ) : rewards.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#C7EF6B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#C7EF6B" stopOpacity="1" />
                </linearGradient>
              </defs>
              {(() => {
                // Calculate chart points
                const maxReward = Math.max(
                  ...rewards.map((r) => parseFloat(r.rewardTokens))
                );
                const minReward = Math.min(
                  ...rewards.map((r) => parseFloat(r.rewardTokens))
                );
                const range = maxReward - minReward || 1; // Avoid division by zero

                const padding = 20;
                const chartWidth = 300 - padding * 2;
                const chartHeight = 100 - padding * 2;
                const pointSpacing = chartWidth / (rewards.length - 1 || 1);

                // Generate path points
                const points = rewards.map((reward, index) => {
                  const x = padding + index * pointSpacing;
                  const normalizedValue =
                    (parseFloat(reward.rewardTokens) - minReward) / range;
                  const y =
                    padding + chartHeight - normalizedValue * chartHeight;
                  return {
                    x,
                    y,
                    round: reward.round,
                    reward: reward.rewardTokens,
                  };
                });

                // Generate smooth path
                const pathData = points
                  .map((point, index) => {
                    if (index === 0) return `M ${point.x} ${point.y}`;
                    const prevPoint = points[index - 1];
                    const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2;
                    const cp1y = prevPoint.y;
                    const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2;
                    const cp2y = point.y;
                    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
                  })
                  .join(" ");

                // Area path (closed)
                const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight + padding} L ${points[0].x} ${chartHeight + padding} Z`;

                return (
                  <>
                    <path d={areaPath} fill="url(#lineGradient)" />
                    <path
                      d={pathData}
                      stroke="#C7EF6B"
                      strokeWidth="2"
                      fill="none"
                    />
                    {points.map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        fill="#C7EF6B"
                      />
                    ))}
                    {/* Highlight latest round */}
                    {points.length > 0 && (
                      <>
                        <line
                          x1={points[points.length - 1].x}
                          y1="0"
                          x2={points[points.length - 1].x}
                          y2="100"
                          stroke="#FFD700"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                        />
                        <rect
                          x={points[points.length - 1].x - 28}
                          y="8"
                          width="56"
                          height="24"
                          fill="#FFD700"
                          rx="4"
                        />
                        <text
                          x={points[points.length - 1].x}
                          y="23"
                          textAnchor="middle"
                          fill="#000"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          Reward
                        </text>
                      </>
                    )}
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No reward data available
            </div>
          )}

          {/* X-axis labels */}
          {rewards.length > 0 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
              {rewards.map((reward, index) => (
                <span key={index} className="text-xs text-gray-400">
                  Round {reward.round}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

